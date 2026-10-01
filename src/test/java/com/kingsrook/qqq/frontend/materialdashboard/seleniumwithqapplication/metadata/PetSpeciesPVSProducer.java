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
import com.kingsrook.qqq.backend.core.model.metadata.possiblevalues.PossibleValueEnum;
import com.kingsrook.qqq.backend.core.model.metadata.possiblevalues.QPossibleValueSource;
import com.kingsrook.qqq.backend.core.utils.StringUtils;


/*******************************************************************************
 ** Meta Data Producer for PetSpecies PVS
 *******************************************************************************/
public class PetSpeciesPVSProducer extends MetaDataProducer<QPossibleValueSource>
{
   public static final String NAME = "petSpecies";



   /***************************************************************************
    *
    ***************************************************************************/
   public enum Value implements PossibleValueEnum<Integer>
   {
      DOG(1),
      CAT(2),
      ELEPHANT(3);


      private final Integer id;



      /***************************************************************************
       *
       ***************************************************************************/
      Value(Integer id)
      {
         this.id = id;
      }



      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public Integer getPossibleValueId()
      {
         return (id);
      }



      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public String getPossibleValueLabel()
      {
         return (StringUtils.allCapsToMixedCase(name()));
      }
   }


   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public QPossibleValueSource produce(QInstance qInstance) throws QException
   {
      return QPossibleValueSource.newForEnum(NAME, Value.values());
   }

}
