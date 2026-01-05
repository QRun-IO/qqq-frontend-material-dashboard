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

import {Children, isValidElement, ReactNode} from "react";

/*******************************************************************************
 ** Sanitize a string for use as a data-qqq-id attribute value.
 ** Converts to lowercase, replaces non-alphanumeric characters with dashes,
 ** and limits length.
 *******************************************************************************/
export function sanitizeId(text: string): string
{
   if (!text)
   {
      return "";
   }

   return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
}

/*******************************************************************************
 ** Extract text content from React children (handles strings, nested elements).
 *******************************************************************************/
export function extractTextFromChildren(children: ReactNode): string
{
   if (typeof children === "string")
   {
      return children;
   }

   if (typeof children === "number")
   {
      return String(children);
   }

   if (Array.isArray(children))
   {
      return children.map(extractTextFromChildren).filter(Boolean).join(" ");
   }

   if (isValidElement(children))
   {
      const props = children.props as {children?: ReactNode};
      if (props.children)
      {
         return extractTextFromChildren(props.children);
      }
   }

   return "";
}

/*******************************************************************************
 ** Generate a data-qqq-id for a button element.
 ** Priority: explicit qqqId > text content > icon name > fallback
 *******************************************************************************/
export function generateButtonId(
   qqqId?: string,
   children?: ReactNode,
   iconName?: string
): string | undefined
{
   if (qqqId)
   {
      return `button-${sanitizeId(qqqId)}`;
   }

   const textContent = children ? extractTextFromChildren(children) : "";
   if (textContent)
   {
      return `button-${sanitizeId(textContent)}`;
   }

   if (iconName)
   {
      return `button-icon-${sanitizeId(iconName)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for an input/text field element.
 ** Priority: explicit qqqId > field name > label
 *******************************************************************************/
export function generateInputId(
   qqqId?: string,
   fieldName?: string,
   label?: string
): string | undefined
{
   if (qqqId)
   {
      return `input-${sanitizeId(qqqId)}`;
   }

   if (fieldName)
   {
      return `input-${sanitizeId(fieldName)}`;
   }

   if (label)
   {
      return `input-${sanitizeId(label)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a select/dropdown element.
 *******************************************************************************/
export function generateSelectId(
   qqqId?: string,
   fieldName?: string,
   label?: string
): string | undefined
{
   if (qqqId)
   {
      return `select-${sanitizeId(qqqId)}`;
   }

   if (fieldName)
   {
      return `select-${sanitizeId(fieldName)}`;
   }

   if (label)
   {
      return `select-${sanitizeId(label)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a switch/checkbox/toggle element.
 *******************************************************************************/
export function generateSwitchId(
   qqqId?: string,
   fieldName?: string,
   label?: string
): string | undefined
{
   if (qqqId)
   {
      return `switch-${sanitizeId(qqqId)}`;
   }

   if (fieldName)
   {
      return `switch-${sanitizeId(fieldName)}`;
   }

   if (label)
   {
      return `switch-${sanitizeId(label)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a navigation/sidebar item.
 *******************************************************************************/
export function generateNavItemId(
   qqqId?: string,
   name?: string,
   route?: string
): string | undefined
{
   if (qqqId)
   {
      return `sidenav-${sanitizeId(qqqId)}`;
   }

   if (name)
   {
      return `sidenav-${sanitizeId(name)}`;
   }

   if (route)
   {
      const routeName = route.split("/").filter(Boolean).pop() || "";
      return `sidenav-${sanitizeId(routeName)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a menu item.
 *******************************************************************************/
export function generateMenuItemId(
   qqqId?: string,
   text?: string,
   index?: number
): string | undefined
{
   if (qqqId)
   {
      return `menu-item-${sanitizeId(qqqId)}`;
   }

   if (text)
   {
      return `menu-item-${sanitizeId(text)}`;
   }

   if (index !== undefined)
   {
      return `menu-item-${index}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a tab element.
 *******************************************************************************/
export function generateTabId(
   qqqId?: string,
   label?: string,
   index?: number
): string | undefined
{
   if (qqqId)
   {
      return `tab-${sanitizeId(qqqId)}`;
   }

   if (label)
   {
      return `tab-${sanitizeId(label)}`;
   }

   if (index !== undefined)
   {
      return `tab-${index}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a table header/column.
 *******************************************************************************/
export function generateTableHeaderId(
   qqqId?: string,
   fieldName?: string,
   headerText?: string
): string | undefined
{
   if (qqqId)
   {
      return `table-header-${sanitizeId(qqqId)}`;
   }

   if (fieldName)
   {
      return `table-header-${sanitizeId(fieldName)}`;
   }

   if (headerText)
   {
      return `table-header-${sanitizeId(headerText)}`;
   }

   return undefined;
}

/*******************************************************************************
 ** Generate a data-qqq-id for a link element.
 *******************************************************************************/
export function generateLinkId(
   qqqId?: string,
   children?: ReactNode,
   href?: string
): string | undefined
{
   if (qqqId)
   {
      return `link-${sanitizeId(qqqId)}`;
   }

   const textContent = children ? extractTextFromChildren(children) : "";
   if (textContent)
   {
      return `link-${sanitizeId(textContent)}`;
   }

   if (href)
   {
      const hrefName = href.split("/").filter(Boolean).pop() || "";
      return `link-${sanitizeId(hrefName)}`;
   }

   return undefined;
}
