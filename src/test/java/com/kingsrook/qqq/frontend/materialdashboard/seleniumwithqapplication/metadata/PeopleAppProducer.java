/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2025.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata;


import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.metadata.MetaDataProducer;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QAppMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QAppSection;


/*******************************************************************************
 ** Meta Data Producer for People App
 *******************************************************************************/
public class PeopleAppProducer extends MetaDataProducer<QAppMetaData>
{
   public static final String NAME = "peopleApp";

   public static final String GREETINGS_APP_NAME = "greetingsApp";


   /***************************************************************************
    *
    ***************************************************************************/
   public static void addTableToGreetingsApp(QInstance qInstance, String tableName)
   {
      qInstance.getApp(GREETINGS_APP_NAME).getSections().get(0).withTable(tableName);
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public QAppMetaData produce(QInstance qInstance) throws QException
   {
      QAppMetaData greetingsApp = new QAppMetaData()
         .withName(GREETINGS_APP_NAME)
         .withSectionOfChildren(new QAppSection()
            .withName("greetings")
            .withTable(PersonTableProducer.NAME)
            .withTable(PetTableProducer.NAME));
      qInstance.addApp(greetingsApp);

      return (new QAppMetaData()
         .withName(NAME)
         .withChild(greetingsApp)
      );
   }

}
