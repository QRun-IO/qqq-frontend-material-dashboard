/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2022.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
   app.use("/dynamic-qfmd-components/*", getRequestHandler());
   app.use("/material-dashboard-backend/*", getRequestHandler());
};
