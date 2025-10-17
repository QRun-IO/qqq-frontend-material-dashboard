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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib;


import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.instances.AbstractQQQApplication;
import com.kingsrook.qqq.backend.core.model.metadata.MetaDataProducerHelper;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.AnonymousAuthenticationProducer;


/***************************************************************************
 * QQQ Application instance used by {@link TestApplicationServer}.
 *
 * By default, the QInstance for this application has the meta data classes
 * produced by the package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.
 *
 * It's expected that individual tests would override
 * {@link QBaseSeleniumWithQApplicationTest#customizeQInstance(QInstance)}
 * to add tables, processes, widgets, etc, needed for their test cases.
 ***************************************************************************/
class TestApplication extends AbstractQQQApplication
{
   private final QInstance qInstance;



   /*******************************************************************************
    ** Constructor
    **
    *******************************************************************************/
   public TestApplication() throws QException
   {
      QInstance qInstance = new QInstance();
      MetaDataProducerHelper.processAllMetaDataProducersInPackage(qInstance, AnonymousAuthenticationProducer.class.getPackageName());
      this.qInstance = qInstance;
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   public QInstance defineQInstance() throws QException
   {
      return this.qInstance;
   }



   /*******************************************************************************
    ** Getter for qInstance
    **
    *******************************************************************************/
   public QInstance getQInstance()
   {
      return this.qInstance;
   }
}
