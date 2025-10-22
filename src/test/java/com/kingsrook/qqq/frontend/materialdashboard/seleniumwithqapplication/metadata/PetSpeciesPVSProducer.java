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
