/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

import {createContext, FC, ReactNode, useContext, useMemo} from "react";

/*******************************************************************************
 ** Context value interface for QQQ ID scoping.
 *******************************************************************************/
interface QqqIdContextValue
{
   scope: string | null;
}

/*******************************************************************************
 ** Create the context with default null scope.
 *******************************************************************************/
const QqqIdContext = createContext<QqqIdContextValue>({scope: null});
QqqIdContext.displayName = "QqqIdContext";

/*******************************************************************************
 ** Props for the QqqIdProvider component.
 *******************************************************************************/
interface QqqIdProviderProps
{
   scope: string;
   children: ReactNode;
}

/*******************************************************************************
 ** Provider component that sets the data-qqq-scope attribute on its children.
 ** Use this to wrap pages or sections to provide context for CSS selectors.
 **
 ** Example:
 **   <QqqIdProvider scope="record-view">
 **      <RecordViewContent />
 **   </QqqIdProvider>
 **
 ** CSS can then target:
 **   [data-qqq-scope="record-view"] [data-qqq-id="button-edit"] { ... }
 *******************************************************************************/
export const QqqIdProvider: FC<QqqIdProviderProps> = ({scope, children}) =>
{
   const value = useMemo(() => ({scope}), [scope]);

   return (
      <QqqIdContext.Provider value={value}>
         <div data-qqq-scope={scope}>
            {children}
         </div>
      </QqqIdContext.Provider>
   );
};

/*******************************************************************************
 ** Hook to access the current QQQ ID scope.
 ** Returns null if not within a QqqIdProvider.
 *******************************************************************************/
export function useQqqScope(): string | null
{
   const context = useContext(QqqIdContext);
   return context.scope;
}

export default QqqIdContext;
