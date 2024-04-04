var express = require('express')
var router = express.Router()
const app = express()

let sql = require("mssql")
const readonlyconfig = require('../server.json')

app.use(express.json())

const pool = new sql.ConnectionPool(readonlyconfig)
const readonlyPoolPromise = pool.connect()
pool.on('error', err => {
  console.log('Database Connection Failed :', err)
})

router.get('/api/lbse/public', async(req, res) => {
  /**
   * @swagger
   * /api/lbse/public:
   *  get:
   *    summary: 給予經緯度回傳地址或附近 POIs
   *    tags: [LBSE]
   *    parameters:
   *      - name: lat
   *        required: true
   *        in: query
   *        description: 緯度
   *        schema:
   *          type: number
   *          format: float
   *        default: 25.04662
   *      - name: lon
   *        required: true
   *        in: query
   *        description: 經度
   *        schema:
   *          type: number
   *          format: float
   *        default: 121.58044
   *      - name: range
   *        required: false
   *        in: query
   *        description: 範圍 (1：100 公尺, 3：300 公尺... 以此類推)；Max：9
   *        schema:
   *          type: number
   *          format: integer
   *        default: 3
   *      - name: scope
   *        required: false
   *        in: query
   *        description: 選擇回傳的 poi 類型 (以 "," 相隔)
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: success
   *      404:  
   *        description: error
   */
  
  const pool = await readonlyPoolPromise
  const request = pool.request()
  
  try {
    const { lat, lon, range, scope } = req.query
    
    request.input("lat", sql.Decimal(18, 15), lat)
    request.input("lon", sql.Decimal(18, 15), lon)
    request.input("range", sql.Int, range > 9 ? Math.pow(3, 2) : Math.pow(range, 2))
    request.input("scope", sql.VarChar, scope)

    let sqlQuery, response;
    if (range != null) {
      sqlQuery = `
        declare @blocks table (BID int)

        insert into @blocks(BID)
        exec xp_nearbyEdge_BID @lat, @lon, @range
        insert into @blocks(BID)
        exec xp_nearbySearch_BID @lat, @lon, @range
              
        select v.OID, v.OCName as CName, v.CDes, v.Type, v.Lat, v.Lon
        from vd_POIs v, BO, @blocks B
        where B.BID = BO.BID and BO.OID = v.OID
      `

      if (scope != null) {
        let options = scope.split(",")
        sqlQuery += " and ("
        options.map((option) => (
          sqlQuery += " or v.Type = '" + option + "'"
        ))
        sqlQuery = sqlQuery.replace(" or ", "") + ")"
      }

      const result = await request.query(sqlQuery)
      response = {
        data: result.recordset
      }
    } else {
      sqlQuery = `
        declare @BID int, @count int
        declare @position varchar(50)

        if (@lat between 21.8 and 25.3) and (@lon between 119 and 122.1)
          select @BID = dbo.fn_GetBlockNum(@lat, @lon)
        else if (@lat between 24.36 and 24.541) and (@lon between 118.14 and 118.509)
          select @BID = dbo.fn_GetIslandBlockNum(@lat, @lon, 0)
        else if (@lat between 25.92 and 26.411) and (@lon between 119.87 and 120.529)
          select @BID = dbo.fn_GetIslandBlockNum(@lat, @lon, 1)

        select @count = count(CID) from CB where BID = @BID
        if (@count > 1) set @position = 'border'
        else if (@count = 1) set @position = 'in'
        else set @position = ''
        select CID, NamePath, @position as position from Class where NamePath = dbo.fn_GeoClass(@lat, @lon)
      `

      const result = await request.query(sqlQuery)
      response = {
        data: result.recordset[0]
      }
    }

    res.send(response)

  } catch (err) {
    res.send(err)
  }
})

router.get('/api/lbse/route', async(req, res) => {
  /**
   * @swagger
   * /api/lbse/route:
   *  get:
   *    summary: 給予路線上經緯度回傳附近 POIs 及路線上的點
   *    tags: [LBSE]
   *    parameters:
   *      - name: lnglat
   *        required: true
   *        in: query
   *        description: 經緯度座標
   *        schema:
   *          type: string
   *        default: 120.9376333 23.949477,120.9375656 23.9494517,120.9359566 23.9503755,120.9378138 23.9494438,120.9462856 23.9659256,120.9465588 23.9673714,120.9594068 23.9633455,120.9725781 23.9560657,120.9726956 23.9566742
   *      - name: scope
   *        required: false
   *        in: query
   *        description: 選擇回傳的 poi 類型 (以 "," 相隔)
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: success
   *      404:  
   *        description: error
   */
  
  const pool = await readonlyPoolPromise
  const request = pool.request()
  
  try {
    const { lnglat, scope } = req.query
    
    request.input("coordinatesString", sql.VarChar, lnglat)
    request.input("scope", sql.VarChar, scope)

    // LBSE
    // let sqlQuery = `
    //   declare @town table(CID int)
      
    //   insert @town
    //   exec xp_nearbyRouteTown @coordinatesString
      
    //   declare @g geometry
    //   set @g = geometry::STMLineFromText('MULTILINESTRING ((' + @coordinatesString + '))', 4326)

    //   select O.OID, O.CName, O.Lat, O.Lon 
    //   from Object O, BO, BC, vd_BitMask vd
    //   where BC.CID in (
    //     select C.CID
    //     from @town t, Class P, Class C, Inheritance I
    //     where t.CID = P.CID and P.CID = I.PCID and I.CCID = C.CID
    //   ) and BC.BID = BO.BID and BO.OID = O.OID and O.OID = vd.OID and vd.CName = '景點'
    // `

    // LBSE + Geometry
    let sqlQuery = `
      declare @town table(CID int)

      insert @town
      exec xp_nearbyRouteTown @coordinatesString
      
      declare @g geometry
      set @g = geometry::STMLineFromText('MULTILINESTRING ((' + @coordinatesString + '))', 4326)
      
      select vd.OID, vd.Type, vd.OCName, vd.CDes, vd.Lat, vd.Lon
      from vd_POIs vd, BO, BC
      where BC.CID in (
        select vd_loc.CID
        from @town t, vd_locationInfo vd_loc
        where t.CID = vd_loc.PCID
      ) and BC.BID = BO.BID and BO.OID = vd.OID
        and vd.Geo.STWithin(@g.STBuffer(0.0005)) = 1
    `

    if (scope != null) {
      let options = scope.split(",")
      sqlQuery += " and ("
      options.map((option) => (
        sqlQuery += " or vd.Type = '" + option + "'"
      ))
      sqlQuery = sqlQuery.replace(" or ", "") + ")"
    }

    const result = await request.query(sqlQuery)

    let response = {
      data: result.recordset
    }

    res.send(response)
  } catch (err) {
    res.send(err)
  }
})

router.get('/api/lbse/detail', async(req, res) => {
  /**
   * @swagger
   * /api/lbse/detail:
   *  get:
   *    summary: POIs 詳細資訊
   *    tags: [LBSE]
   *    parameters:
   *      - name: oid
   *        required: true
   *        in: query
   *        description: oid
   *        schema:
   *          type: number
   *      - name: poiType
   *        required: true
   *        in: query
   *        description: poi 類型
   *        schema:
   *          type: number
   *    responses:
   *      200:
   *        description: success
   *      404:  
   *        description: error
   */
  
  const pool = await readonlyPoolPromise
  const request = pool.request()
  
  try {
    const { oid, poiType } = req.query
    
    request.input("oid", sql.Int, oid)
    request.input("poiType", sql.Int, poiType)

    let sqlQuery, response;

    if (poiType == 1) {
      sqlQuery = `
        select * from RoadMixData where RID = @oid
      `
    } else if (poiType == 2) {
      sqlQuery = `
        select * from Parks where PID = @oid
      `
    } else if (poiType == 3) {
      sqlQuery = `
        select * from SpeedLimit where SID = @oid
      `
    }

    const result = await request.query(sqlQuery)
    response = {
      data: result.recordset[0]
    }

    res.send(response)

  } catch (err) {
    res.send(err)
  }
})

module.exports = router
