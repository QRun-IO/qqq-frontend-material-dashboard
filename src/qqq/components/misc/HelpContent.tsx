/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2023.  Kingsrook, LLC
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

import {QHelpContent} from "@qrunio/qqq-frontend-core/lib/model/metaData/QHelpContent";
import Box from "@mui/material/Box";
import parse from "html-react-parser";
import ErrorBoundary from "qqq/components/misc/ErrorBoundary";
import React, {useContext} from "react";
import Markdown from "react-markdown";
import QContext from "QContext";

interface Props
{
   helpContents: null | QHelpContent | QHelpContent[];
   roles: string[];
   heading?: string;
   helpContentKey?: string;
}

HelpContent.defaultProps = {};


/*******************************************************************************
 ** format some content - meaning, change it from string to JSX element(s) or string.
 ** does a parse() for HTML, and a <Markdown> for markdown, else just text.
 *******************************************************************************/
const formatHelpContent = (content: string, format: string): string | JSX.Element | JSX.Element[] =>
{
   if (format == "HTML")
   {
      return parse(content);
   }
   else if (format == "MARKDOWN")
   {
      return (<Markdown>{content}</Markdown>)
   }

   return content;
}


/*******************************************************************************
 ** return the first help content from the list that matches the first role
 ** in the roles list.
 *******************************************************************************/
const getMatchingHelpContent = (helpContents: QHelpContent[], roles: string[]): QHelpContent =>
{
   if (helpContents)
   {
      if (helpContents.length == 1 && helpContents[0].roles.size == 0)
      {
         //////////////////////////////////////////////////////////////////////////////////////////////////
         // if there's only 1 entry, and it has no roles, then assume user wanted it globally and use it //
         //////////////////////////////////////////////////////////////////////////////////////////////////
         return (helpContents[0]);
      }
      else
      {
         for (let i = 0; i < roles.length; i++)
         {
            for (let j = 0; j < helpContents.length; j++)
            {
               if (helpContents[j].roles.has(roles[i]))
               {
                  return(helpContents[j])
               }
            }
         }
      }
   }

   return (null);
}


/*******************************************************************************
 ** test if a list of help contents would find any matches from a list of roles.
 *******************************************************************************/
export const hasHelpContent = (helpContents: null | QHelpContent | QHelpContent[], roles: string[]) =>
{
   return getMatchingHelpContent(nullOrSingletonOrArrayToArray(helpContents), roles) != null;
}


/*******************************************************************************
 **
 *******************************************************************************/
const nullOrSingletonOrArrayToArray = (helpContents: null | QHelpContent | QHelpContent[]): QHelpContent[] =>
{
   let array: QHelpContent[] = [];
   if(Array.isArray(helpContents))
   {
      array = helpContents;
   }
   else if(helpContents != null)
   {
      array.push(helpContents);
   }
   return (array);
}


/*******************************************************************************
 ** component that renders a box of formatted help content, from a list of
 ** helpContents (from meta-data), and for a list of roles (based on what screen
 *******************************************************************************/
function HelpContent({helpContents, roles, heading, helpContentKey}: Props): JSX.Element
{
   const {helpHelpActive} = useContext(QContext);
   const helpContentsArray = nullOrSingletonOrArrayToArray(helpContents);
   let selectedHelpContent = getMatchingHelpContent(helpContentsArray, roles);

   let content = null;
   let errorContent = "Error rendering help content.";
   if (helpHelpActive)
   {
      if (!selectedHelpContent)
      {
         selectedHelpContent = new QHelpContent({content: ""});
      }
      content = selectedHelpContent.content + ` [${helpContentKey ?? "?"}]`;
      errorContent += ` [${helpContentKey ?? "?"}]`;
   }
   else if(selectedHelpContent)
   {
      content = selectedHelpContent.content;
   }

   ///////////////////////////////////////////////////
   // if content was found, format it and return it //
   ///////////////////////////////////////////////////
   if (content)
   {
      return <Box display="inline" className="helpContent">
         {heading && <span className="header">{heading}</span>}
         <ErrorBoundary errorElement={<i>{errorContent}</i>}>
            {formatHelpContent(content, selectedHelpContent.format)}
         </ErrorBoundary>
      </Box>;
   }

   return (null);
}

export default HelpContent;
