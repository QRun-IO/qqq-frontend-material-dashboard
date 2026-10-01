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

export interface QHistoryEntry
{
   iconName: string;
   label: string;
   path: string;
   date?: Date;
}

export interface QHistory
{
   entries: QHistoryEntry[];
}


export default class HistoryUtils
{
   private static LS_KEY = "qqq.history";


   /*******************************************************************************
    ** Push an entry into the history
    *******************************************************************************/
   public static push = (entry: QHistoryEntry) =>
   {
      const history = HistoryUtils.get();

      if(!entry.date)
      {
         entry.date = new Date()
      }

      for (let i = 0; i < history.entries.length; i++)
      {
         if(history.entries[i].path == entry.path)
         {
            history.entries.splice(i, 1);
         }
      }

      history.entries.push(entry);

      if(history.entries.length > 20)
      {
         history.entries.splice(0, history.entries.length - 3);
      }

      localStorage.setItem(HistoryUtils.LS_KEY, JSON.stringify(history));
   };



   /*******************************************************************************
    ** Get the history
    *******************************************************************************/
   public static get = (): QHistory =>
   {
      const existingJSON = localStorage.getItem(HistoryUtils.LS_KEY);
      const history: QHistory = existingJSON ? JSON.parse(existingJSON) : {}
      if(!history.entries)
      {
         history.entries = [];
      }

      return (history);
   };


   /*******************************************************************************
    ** make sure a specific path isn't in the history (e.g., after a 404)
    *******************************************************************************/
   public static ensurePathNotInHistory(path: string)
   {
      const history = HistoryUtils.get();

      for (let i = 0; i < history.entries.length; i++)
      {
         if(history.entries[i].path == path)
         {
            history.entries.splice(i, 1);
         }
      }

      localStorage.setItem(HistoryUtils.LS_KEY, JSON.stringify(history));
   }
}

