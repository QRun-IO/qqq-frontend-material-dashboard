/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/////////////////////////////////////////////////////////////////////////////////////
// this file "magically" works with http-proxy-middleware.                         //
// Most API calls to the qqq backend (e.g., through QController) do NOT go through //
// the React Router.  However, exports do (presumably because they are full-       //
// page style requests, not ajax/fetches), so they need specific proxy config.     //
/////////////////////////////////////////////////////////////////////////////////////
const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = function (app)
{
   let port = 8000;
   if(process.env.REACT_APP_PROXY_LOCALHOST_PORT)
   {
      port = process.env.REACT_APP_PROXY_LOCALHOST_PORT;
   }

   function getRequestHandler()
   {
      return createProxyMiddleware({
         target: `http://localhost:${port}`,
         changeOrigin: true,
      });
   }

   app.use("/data/*/export/*", getRequestHandler());
   app.use("/download/*", getRequestHandler());
   app.use("/metaData", getRequestHandler());
   app.use("/metaData/*", getRequestHandler());
   app.use("/data/*", getRequestHandler());
   app.use("/possibleValues/*", getRequestHandler());
   app.use("/possibleValues", getRequestHandler());
   app.use("/widget/*", getRequestHandler());
   app.use("/serverInfo", getRequestHandler());
   app.use("/manageSession", getRequestHandler());
   app.use("/processes", getRequestHandler());
   app.use("/reports", getRequestHandler());
   app.use("/images", getRequestHandler());
   app.use("/api*", getRequestHandler());
   app.use("/*api", getRequestHandler());
   app.use("/qqq/*", getRequestHandler());
   app.use("/_posthog", getRequestHandler());
   app.use("/_posthog/*", getRequestHandler());
   app.use("/dynamic-qfmd-components/*", getRequestHandler());
   app.use("/material-dashboard-backend/*", getRequestHandler());

   app.use((req, res, next) =>
   {
      res.setHeader("Access-Control-Allow-Origin", "*") // or 'https://localhost:3000'
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
      res.setHeader("Access-Control-Allow-Credentials", "true")

      if (req.method === "OPTIONS")
      {
         return res.sendStatus(204)
      }

      next()
   })

   app.use("/lookerAuth*", getRequestHandler());
};
