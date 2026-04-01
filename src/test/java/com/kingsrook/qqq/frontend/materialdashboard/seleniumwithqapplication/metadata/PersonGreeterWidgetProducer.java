/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2026.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata;


import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.ProcessWidgetRenderer;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.metadata.MetaDataProducer;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;


/*******************************************************************************
 ** Meta Data Producer for PersonGreeterWidget — a process-type widget that
 ** renders the PersonGreeterProcess inline on the record view screen.
 *******************************************************************************/
public class PersonGreeterWidgetProducer extends MetaDataProducer<QWidgetMetaData>
{
   public static final String NAME = "PersonGreeterWidget";



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public QWidgetMetaData produce(QInstance qInstance) throws QException
   {
      return new QWidgetMetaData()
         .withType(WidgetType.PROCESS.getType())
         .withIsCard(true)
         .withName(NAME)
         .withLabel("Person Greeter")
         .withGridColumns(12)
         .withDefaultValue(ProcessWidgetRenderer.WIDGET_PROCESS_NAME, PersonGreeterProcessProducer.NAME)
         .withCodeReference(new QCodeReference(ProcessWidgetRenderer.class));
   }

}
