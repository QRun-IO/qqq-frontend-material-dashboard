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

import {AdornmentType} from "@qrunio/qqq-frontend-core/lib/model/metaData/AdornmentType";
import {QFieldMetaData} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldMetaData";
import {QFieldType} from "@qrunio/qqq-frontend-core/lib/model/metaData/QFieldType";
import {QInstance} from "@qrunio/qqq-frontend-core/lib/model/metaData/QInstance";
import {QTableVariant} from "@qrunio/qqq-frontend-core/lib/model/metaData/QTableVariant";
import {QRecord} from "@qrunio/qqq-frontend-core/lib/model/QRecord";
import "datejs"; // https://github.com/datejs/Datejs
import {Chip, ClickAwayListener, Icon} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import parse from "html-react-parser";
import HtmlUtils from "qqq/utils/HtmlUtils";
import Client from "qqq/utils/qqq/Client";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-sql";
import React, {Fragment, useReducer, useState} from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-velocity";
import {Link} from "react-router-dom";

/*******************************************************************************
 ** Utility class for working with QQQ Values
 **
 *******************************************************************************/
class ValueUtils
{
   public static qInstance: QInstance = null;
   public static loadingQInstance = false;

   private static getQInstance(): QInstance
   {
      if (ValueUtils.qInstance == null)
      {
         if (ValueUtils.loadingQInstance)
         {
            return (null);
         }

         ValueUtils.loadingQInstance = true;
         const qController = Client.getInstance();
         (async () =>
         {
            ValueUtils.qInstance = await qController.loadMetaData();
         })();

         return (null);
      }

      return ValueUtils.qInstance;
   }


   /*******************************************************************************
    ** When you have a field, and a record - call this method to get a string or
    ** element back to display the field's value.
    *******************************************************************************/
   public static getDisplayValue(field: QFieldMetaData, record: QRecord, usage: "view" | "query" = "view", overrideFieldName?: string, tableVariant?: QTableVariant): string | JSX.Element | JSX.Element[]
   {
      const fieldName = overrideFieldName ?? field.name;

      const displayValue = record.displayValues ? record.displayValues.get(fieldName) : undefined;
      const rawValue = record.values ? record.values.get(fieldName) : undefined;

      return ValueUtils.getValueForDisplay(field, rawValue, displayValue, usage, tableVariant, record, fieldName);
   }


   /*******************************************************************************
    ** When you have a field and a value (either just a raw value, or a raw and
    ** display value), call this method to get a string Element to display.
    *******************************************************************************/
   public static getValueForDisplay(field: QFieldMetaData, rawValue: any, displayValue: any = rawValue, usage: "view" | "query" = "view", tableVariant?: QTableVariant, record?: QRecord, fieldName?: string): string | JSX.Element | JSX.Element[]
   {
      if (field.hasAdornment(AdornmentType.LINK))
      {
         const adornment = field.getAdornment(AdornmentType.LINK);
         let href = String(rawValue);

         let toRecordFromTable = adornment.getValue("toRecordFromTable");

         /////////////////////////////////////////////////////////////////////////////////////
         // if the link adornment has a 'toRecordFromTableDynamic', then look for a display //
         // value named `fieldName`:toRecordFromTableDynamic for the table name.            //
         /////////////////////////////////////////////////////////////////////////////////////
         if(adornment.getValue("toRecordFromTableDynamic"))
         {
            const toRecordFromTableDynamic = record?.displayValues?.get(fieldName + ":toRecordFromTableDynamic");
            if(toRecordFromTableDynamic)
            {
               toRecordFromTable = toRecordFromTableDynamic;
            }
            else
            {
               ///////////////////////////////////////////////////////////////////
               // if the table name isn't known, then return w/o the adornment. //
               ///////////////////////////////////////////////////////////////////
               return (ValueUtils.getUnadornedValueForDisplay(field, rawValue, displayValue));
            }
         }

         if (toRecordFromTable)
         {
            if (ValueUtils.getQInstance())
            {
               let tablePath = ValueUtils.getQInstance().getTablePathByName(toRecordFromTable);
               if (!tablePath)
               {
                  console.log("Couldn't find path for table: " + toRecordFromTable);
                  return (ValueUtils.getUnadornedValueForDisplay(field, rawValue, displayValue));
               }

               if (!tablePath.endsWith("/"))
               {
                  tablePath += "/";
               }
               href = tablePath + rawValue;
            }
            else
            {
               //////////////////////////////////////////////////////////////////////////////////
               // if no instance, we can't get the table path, so we can't do a to-record link //
               //////////////////////////////////////////////////////////////////////////////////
               return (ValueUtils.getUnadornedValueForDisplay(field, rawValue, displayValue));
            }
         }

         if (!href)
         {
            return ("");
         }

         if (href.startsWith("http"))
         {
            return (<a target={adornment.getValue("target") ?? "_self"} href={href} onClick={(e) => e.stopPropagation()}>{displayValue ?? rawValue}</a>);
         }
         else
         {
            return (<Link target={adornment.getValue("target") ?? "_self"} to={href} onClick={(e) => e.stopPropagation()}>{displayValue ?? rawValue}</Link>);
         }
      }

      if (field.hasAdornment(AdornmentType.REVEAL))
      {
         return (<RevealComponent fieldName={field.name} value={displayValue} usage={usage} />);
      }

      if (field.hasAdornment(AdornmentType.RENDER_HTML))
      {
         return (rawValue ? parse(rawValue) : "");
      }

      if (field.hasAdornment(AdornmentType.CHIP))
      {
         if (!displayValue)
         {
            return (<span />);
         }

         const adornment = field.getAdornment(AdornmentType.CHIP);
         const color = adornment.getValue("color." + rawValue) ?? "default";
         const iconName = adornment.getValue("icon." + rawValue) ?? null;
         const iconElement = iconName ? <Icon>{iconName}</Icon> : null;
         return (<Chip label={displayValue} color={color} icon={iconElement} size="small" variant="outlined" sx={{fontWeight: 500}} />);
      }

      if (field.hasAdornment(AdornmentType.CODE_EDITOR))
      {
         let mode = "text";
         const adornmentValues = field.getAdornment(AdornmentType.CODE_EDITOR).values;
         if (adornmentValues && adornmentValues.has("languageMode"))
         {
            mode = adornmentValues.get("languageMode");
         }

         if (usage === "view")
         {
            return (<CodeViewer name={field.name} mode={mode} code={rawValue} />);
         }
         else
         {
            return rawValue;
         }
      }

      if (field.hasAdornment(AdornmentType.ERROR))
      {
         return (
            <Box color={"darkred"} alignContent={"baseline"}>
               <Box mr={2} sx={{float: "left"}}>
                  <Icon>warning</Icon>
               </Box>
               <Box sx={{float: "left"}}>
                  {rawValue}
               </Box>
            </Box>
         );
      }

      if (field.type == QFieldType.BLOB || field.hasAdornment(AdornmentType.FILE_DOWNLOAD))
      {
         let url = this.getUrlFromBlobOrFileDownloadField(rawValue, tableVariant, field, record, fieldName);

         if(!url)
         {
            ////////////////////////////////////////////////////////////////
            // if the url isn't available, then return w/o the adornment. //
            ////////////////////////////////////////////////////////////////
            return (ValueUtils.getUnadornedValueForDisplay(field, rawValue, displayValue));
         }

         return (<BlobComponent field={field} url={url} filename={displayValue} usage={usage} />);
      }

      return (ValueUtils.getUnadornedValueForDisplay(field, rawValue, displayValue));
   }


   /***************************************************************************
    *
    ***************************************************************************/
   public static getUrlFromBlobOrFileDownloadField(rawValue: any, tableVariant: QTableVariant, field: QFieldMetaData, record: QRecord, fieldName: string)
   {
      let url = rawValue;
      if (tableVariant)
      {
         url += "?tableVariant=" + encodeURIComponent(JSON.stringify(tableVariant));
      }

      //////////////////////////////////////////////////////////////////////////////
      // if the field has the download adornment with a downloadUrlDynamic value, //
      // then get the url from a displayValue of `fieldName`:downloadUrlDynamic.  //
      //////////////////////////////////////////////////////////////////////////////
      if (field.hasAdornment(AdornmentType.FILE_DOWNLOAD))
      {
         const adornment = field.getAdornment(AdornmentType.FILE_DOWNLOAD);
         let downloadUrlDynamicAdornmentValue = adornment.getValue("downloadUrlDynamic");
         if (downloadUrlDynamicAdornmentValue)
         {
            const downloadUrlDynamicValue = record?.displayValues?.get(fieldName + ":downloadUrlDynamic");
            if (downloadUrlDynamicValue)
            {
               url = downloadUrlDynamicValue;
            }
         }
      }
      return url;
   }

   /*******************************************************************************
    ** After we know there's no element to be returned (e.g., because no adornment),
    ** this method does the string formatting.
    *******************************************************************************/
   public static getUnadornedValueForDisplay(field: QFieldMetaData, rawValue: any, displayValue: any): string | JSX.Element
   {
      if (!displayValue && field.defaultValue)
      {
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // note, at one point in time, we used a field's default value here if no displayValue... but that feels 100% wrong,   //
         // e.g., a null field would show up (on a query or view screen) has having some value!                                 //
         // not sure if this was maybe supposed to be displayValue = rawValue, but, keep that in mind, and keep this block here //
         // in case we run into issues and need to revisit/rethink                                                              //
         /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
         // displayValue = field.defaultValue;
      }

      if (field.type === QFieldType.DATE_TIME)
      {
         if (displayValue && displayValue != rawValue)
         {
            //////////////////////////////////////////////////////////////////////////////
            // if the date-time actually has a displayValue set, and it isn't just the  //
            // raw-value being copied into the display value by whoever called us, then //
            // return the display value.                                                //
            //////////////////////////////////////////////////////////////////////////////
            return displayValue;
         }

         if (!rawValue)
         {
            return ("");
         }
         const date = new Date(rawValue);
         return this.formatDateTime(date);
      }
      else if (field.type === QFieldType.DATE)
      {
         // unclear if we need any customization for DATE or TIME, but leaving blocks for them just in case
         return (displayValue);
      }
      else if (field.type === QFieldType.TIME)
      {
         return (displayValue);
      }
      else if (field.type === QFieldType.BOOLEAN && (typeof displayValue) === "boolean")
      {
         return displayValue ? "Yes" : "No";
      }

      let returnValue = displayValue;
      if (displayValue === undefined && rawValue !== undefined)
      {
         returnValue = rawValue;
      }

      if (typeof returnValue === "string" && returnValue.indexOf("\n") > -1)
      {
         return ValueUtils.breakTextIntoLines(returnValue);
      }

      return (returnValue);
   }

   public static formatDate(date: Date)
   {
      if (!(date instanceof Date))
      {
         ////////////////////////////////////////////////////////////////////////////////////
         // so, a new Date here will interpret the string as being at midnight UTC, but    //
         // the data object will be in the user/browser timezone.                          //
         // so "2024-08-22", for a user in US/Central, will be "2024-08-21T19:00:00-0500". //
         // correct for that by adding the date's timezone offset (converted from minutes  //
         // to millis) back to it                                                          //
         ////////////////////////////////////////////////////////////////////////////////////
         date = new Date(date);
         date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
      }
      // @ts-ignore
      return (`${date.toString("yyyy-MM-dd")}`);
   }

   public static formatDateTime(date: Date)
   {
      if (!(date instanceof Date))
      {
         date = new Date(date);
      }

      // @ts-ignore
      return (`${date.toString("yyyy-MM-dd hh:mm:ss")} ${date.getHours() < 12 ? "AM" : "PM"} ${date.getTimezone()}`);
   }

   public static formatTime(date: Date)
   {
      if (!(date instanceof Date))
      {
         date = new Date(date);
      }
      // @ts-ignore
      return (`${date.toString("hh:mm:ss")} ${date.getHours() < 12 ? "AM" : "PM"} ${date.getTimezone()}`);
   }

   public static formatDateTimeISO8601(date: Date)
   {
      if (!(date instanceof Date))
      {
         date = new Date(date);
      }
      // @ts-ignore
      return (`${date.toString("yyyy-MM-ddTHH:mm:ssZ")}`);
   }

   public static formatDateISO8601(date: Date)
   {
      if (!(date instanceof Date))
      {
         date = new Date(date);
      }
      // @ts-ignore
      return (`${date.toString("yyyy-MM-dd")}`);
   }

   public static formatDateTimeForFileName(date: Date)
   {
      const zp = (value: number): string => (value < 10 ? `0${value}` : `${value}`);
      const d = new Date();
      const dateString = `${d.getFullYear()}-${zp(d.getMonth() + 1)}-${zp(d.getDate())} ${zp(d.getHours())}${zp(d.getMinutes())}`;
      return (dateString);
   }

   public static getFullWeekday(date: Date)
   {
      if (!(date instanceof Date))
      {
         date = new Date(date);
      }
      // @ts-ignore
      return (`${date.toString("dddd")}`);
   }

   public static formatBoolean(value: any)
   {
      if (value === true)
      {
         return ("Yes");
      }
      else if (value === false)
      {
         return ("No");
      }
      return (null);
   }

   public static getFormattedNumber(n: number): string
   {
      try
      {
         if (n !== null && n !== undefined)
         {
            return (n.toLocaleString());
         }
         else
         {
            return ("");
         }
      }
      catch (e)
      {
         return (String(n));
      }
   }

   public static breakTextIntoLines(value: string): JSX.Element
   {
      if (!value)
      {
         return <Fragment />;
      }

      return (
         <Fragment>
            {value.split(/\n/).map((value: string, index: number) => (
               // eslint-disable-next-line react/no-array-index-key
               <Fragment key={index}>
                  <span>{value}</span>
                  <br />
               </Fragment>
            ))}
         </Fragment>
      );
   }

   /*******************************************************************************
    ** Take a date-time value, and format it the way the ui's date-times want it
    ** to be.
    *******************************************************************************/
   public static formatDateTimeValueForForm(value: string): string
   {
      if (value === null || value === undefined)
      {
         return (value);
      }

      if (value.match(/^\d{4}-\d{2}-\d{2}$/))
      {
         //////////////////////////////////////////////////////////////////
         // if we just passed in a date (w/o time), attach T00:00 to it. //
         //////////////////////////////////////////////////////////////////
         return (value + "T00:00");
      }
      else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/))
      {
         ///////////////////////////////////////////////////////////////////////////////////////////////////////
         // If the passed in string has a Z on the end (e.g., in UTC) - make a Date object - the browser will //
         // shift the value into the user's time zone, so it will display correctly for them                  //
         ///////////////////////////////////////////////////////////////////////////////////////////////////////
         const date = new Date(value);

         // @ts-ignore
         const formattedDate = `${date.toString("yyyy-MM-ddTHH:mm")}`;

         console.log(`Converted UTC date value string [${value}] to local time value for form [${formattedDate}]`);

         return (formattedDate);
      }
      else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*/))
      {
         ///////////////////////////////////////////////////////////////////////////////////
         // if we passed in something too long (e.g., w/ seconds and fractions), trim it. //
         ///////////////////////////////////////////////////////////////////////////////////
         return (value.substring(0, 16));
      }
      else
      {
         ////////////////////////////////////////
         // by default, return the input value //
         ////////////////////////////////////////
         return (value);
      }
   }

   /*******************************************************************************
    **
    *******************************************************************************/
   private static zeroPad = (n: number): string =>
   {
      if (n < 10)
      {
         return ("0" + n);
      }
      return (`${n}`);
   };

   /*******************************************************************************
    ** Take a string date (w/o a timezone) like that our calendar widgets make,
    ** and convert it to UTC, e.g., for submitting to the backend.
    *******************************************************************************/
   public static frontendLocalZoneDateTimeStringToUTCStringForBackend(param: string)
   {
      let localDate = new Date(param);
      let month = (1 + localDate.getUTCMonth());
      let zp = ValueUtils.zeroPad;
      let toPush = localDate.getUTCFullYear() + "-" + zp(month) + "-" + zp(localDate.getUTCDate()) + "T" + zp(localDate.getUTCHours()) + ":" + zp(localDate.getUTCMinutes()) + ":" + zp(localDate.getUTCSeconds()) + "Z";
      console.log(`Input date was ${localDate}.  Sending to backend as ${toPush}`);
      return toPush;
   }


   /*******************************************************************************
    ** for building CSV in frontends, cleanse null & undefined, and escape "'s
    *******************************************************************************/
   public static cleanForCsv(param: any): string
   {
      if (param === undefined || param === null)
      {
         return ("");
      }

      return (String(param).replaceAll(/"/g, "\"\""));
   }

   /*******************************************************************************
    * run toLocaleString on a number (e.g., to commafy), but return a default if
    * it's null or undefined.  The default defaults to empty string, but can be
    * overridden.
    *******************************************************************************/
   public static safeToLocaleString(n: Number, defaultIfNullOrUndefined: string = ""): string
   {
      if (n != null && n != undefined)
      {
         return (n.toLocaleString());
      }
      return (defaultIfNullOrUndefined);
   }

}

////////////////////////////////////////////////////////////////////////////////////////////////
// little private component here, for rendering an AceEditor with some buttons/controls/state //
////////////////////////////////////////////////////////////////////////////////////////////////
function CodeViewer({name, mode, code}: { name: string; mode: string; code: string; }): JSX.Element
{
   const [activeCode, setActiveCode] = useState(code);
   const [isFormatted, setIsFormatted] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null as string);
   const [resetErrorTimeout, setResetErrorTimeout] = useState(null as any);

   const isFormattable = (mode: string): boolean =>
   {
      return (mode === "json" || mode === "sql");
   };

   const formatCode = () =>
   {
      if (isFormatted)
      {
         setActiveCode(code);
         setIsFormatted(false);
      }
      else
      {
         try
         {
            let formatted = activeCode;

            if (mode === "json")
            {
               formatted = JSON.stringify(JSON.parse(activeCode), null, 3);
            }
            else if (mode === "sql")
            {
               formatted = code;
               if (formatted.match(/(^|\s)SELECT\s.*\sFROM\s/i))
               {
                  const beforeAndAfterFrom = formatted.split(/\sFROM\s/, 2);
                  let beforeFrom = beforeAndAfterFrom[0];
                  beforeFrom = beforeFrom.replaceAll(/,\s*/gi, ",\n   ");
                  const afterFrom = beforeAndAfterFrom[1];
                  formatted = beforeFrom + " FROM " + afterFrom;
               }
               formatted = formatted.replaceAll(/(\s*\b(SELECT|SELECT DISTINCT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|INNER JOIN|LEFT JOIN|RIGHT JOIN)\b\s*)/gi, "\n$2\n   ");
               formatted = formatted.replaceAll(/(\s*\b(AND|OR)\b\s*)/gi, "\n   $2 ");
               formatted = formatted.replaceAll(/^\s*/g, "");
            }
            else
            {
               console.log(`Unsupported mode for formatting [${mode}]`);
            }

            setActiveCode(formatted);
            setIsFormatted(true);
         }
         catch (e)
         {
            setErrorMessage("Error formatting code: " + e);
            clearTimeout(resetErrorTimeout);
            setResetErrorTimeout(setTimeout(() =>
            {
               setErrorMessage(null);
            }, 5000));
            console.log("Error formatting code: " + e);
         }
      }
   };

   const toggleSize = () =>
   {
      setIsExpanded(!isExpanded);
   };

   return (
      <Box component="span">
         {isFormattable(mode) && code && <Button onClick={() => formatCode()}>{isFormatted ? "Reset Format" : `Format ${mode.toUpperCase()}`}</Button>}
         {code && <Button onClick={() => toggleSize()}>{isExpanded ? "Collapse" : "Expand"}</Button>}
         {errorMessage}
         <br />
         <AceEditor
            mode={mode}
            theme="github"
            name={name}
            editorProps={{$blockScrolling: true}}
            setOptions={{useWorker: false}}
            value={activeCode}
            readOnly
            highlightActiveLine={false}
            width="100%"
            style={{border: "1px solid gray", marginBottom: "1rem"}}
            showPrintMargin={false}
            height={isExpanded ? "80vh" : code ? "200px" : "50px"}
         />
      </Box>);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// little private component here, for rendering "secret-ish" values, that you can click to reveal or copy //
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function RevealComponent({fieldName, value, usage}: { fieldName: string, value: string, usage: string; }): JSX.Element
{
   const [adornmentFieldsMap, setAdornmentFieldsMap] = useState(new Map<string, boolean>);
   const [, forceUpdate] = useReducer((x) => x + 1, 0);
   const [tooltipOpen, setToolTipOpen] = useState(false);
   const [displayValue, setDisplayValue] = useState(value ? value.replace(/./g, "*") : "");

   const handleTooltipClose = () =>
   {
      setToolTipOpen(false);
   };

   const handleTooltipOpen = () =>
   {
      setToolTipOpen(true);
   };

   const handleRevealIconClick = (event: React.MouseEvent<HTMLSpanElement>, fieldName: string) =>
   {
      event.stopPropagation();
      const displayValue = (adornmentFieldsMap.get(fieldName)) ? value.replace(/./g, "*") : value;
      setDisplayValue(displayValue);
      adornmentFieldsMap.set(fieldName, !adornmentFieldsMap.get(fieldName));
      setAdornmentFieldsMap(adornmentFieldsMap);
      forceUpdate();
   };

   const copyToClipboard = (event: React.MouseEvent<HTMLSpanElement>, value: string) =>
   {
      event.stopPropagation();
      navigator.clipboard.writeText(value);
      setToolTipOpen(true);
   };

   return (
      <>
         {
            displayValue && (
               adornmentFieldsMap.get(fieldName) === true ? (
                  <Box component="span">
                     <Icon onClick={(e) => handleRevealIconClick(e, fieldName)} sx={{cursor: "pointer", fontSize: "15px !important", position: "relative", top: "3px", marginRight: "5px"}}>visibility_on</Icon>
                     {displayValue}
                     <ClickAwayListener onClickAway={handleTooltipClose}>
                        <Tooltip
                           sx={{zIndex: 1000, border: "1px solid red"}}
                           onClose={handleTooltipClose}
                           open={tooltipOpen}
                           disableFocusListener
                           disableHoverListener
                           disableTouchListener
                           placement="right"
                           title="Copied To Clipboard"
                        >
                           <Icon onClick={(e) => copyToClipboard(e, value)} sx={{cursor: "pointer", fontSize: "15px !important", position: "relative", top: "3px", marginLeft: "5px"}}>copy</Icon>
                        </Tooltip>
                     </ClickAwayListener>
                  </Box>
               ) : (
                  <Box display="inline"><Icon onClick={(e) => handleRevealIconClick(e, fieldName)} sx={{cursor: "pointer", fontSize: "15px !important", position: "relative", top: "3px", marginRight: "5px"}}>visibility_off</Icon>{displayValue}</Box>
               )
            )
         }
      </>
   );
}


interface BlobComponentProps
{
   field: QFieldMetaData;
   url: string;
   filename: string;
   usage: "view" | "query";
}

BlobComponent.defaultProps = {
   usage: "view",
};

function BlobComponent({field, url, filename, usage}: BlobComponentProps): JSX.Element
{
   const download = (event: React.MouseEvent<HTMLSpanElement>) =>
   {
      event.stopPropagation();
      HtmlUtils.downloadUrlViaIFrame(field, url, filename);
   };

   const open = (event: React.MouseEvent<HTMLSpanElement>) =>
   {
      event.stopPropagation();
      HtmlUtils.openInNewWindow(url, filename);
   };

   if (!filename || !url)
   {
      return (<React.Fragment />);
   }

   const tooltipPlacement = usage == "view" ? "bottom" : "right";
   const downloadUrl = url + (url.indexOf("?") > -1 ? "&" : "?") + "download"

   // todo - thumbnails if adorned?
   return (
      <Box display="inline-flex">
         {
            usage == "view" && filename
         }
         <Tooltip placement={tooltipPlacement} title="Open file">
            {
               field.type == QFieldType.BLOB ? (
                  <Icon className={"blobIcon"} fontSize="small" onClick={(e) => open(e)}>open_in_new</Icon>
               ) : (
                  <a style={{color: "inherit"}} rel="noopener noreferrer" href={url} target="_blank"><Icon className={"blobIcon"} fontSize="small">open_in_new</Icon></a>
               )
            }
         </Tooltip>
         <Tooltip placement={tooltipPlacement} title="Download file">
            {
               field.type == QFieldType.BLOB ? (
                  <Icon className={"blobIcon"} fontSize="small" onClick={(e) => download(e)}>save_alt</Icon>
               ) : (
                  <a style={{color: "inherit"}} href={downloadUrl}><Icon className={"blobIcon"} fontSize="small">save_alt</Icon></a>
               )
            }
         </Tooltip>
         {
            usage == "query" && filename
         }
      </Box>
   );
}


export default ValueUtils;
