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


import java.util.List;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.metadata.MetaDataProducer;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.processes.NoCodeWidgetFrontendComponentMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QBackendStepMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QComponentType;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QFrontendComponentMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QFrontendStepMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QFunctionInputMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.processes.QProcessMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.nocode.WidgetHtmlLine;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QCriteriaOperator;
import com.kingsrook.qqq.backend.core.model.actions.tables.query.QFilterCriteria;


/*******************************************************************************
 ** Meta Data Producer for PersonGreeterProcess — a simple process used to test
 ** process-type widgets on the RecordScreen.
 *******************************************************************************/
public class PersonGreeterProcessProducer extends MetaDataProducer<QProcessMetaData>
{
   public static final String NAME = "personGreeterProcess";



   /*******************************************************************************
    **
    *******************************************************************************/
   @Override
   public QProcessMetaData produce(QInstance qInstance) throws QException
   {
      return new QProcessMetaData()
         .withName(NAME)
         .withLabel("Person Greeter")

         /////////////////////////////////////////////////////////////////////
         // Step 1: Frontend — input form + output display (NoCode widget)  //
         /////////////////////////////////////////////////////////////////////
         .withStep(new QFrontendStepMetaData()
            .withName("enterInputs")
            .withLabel("Person Greeter")
            .withComponent(new QFrontendComponentMetaData()
               .withType(QComponentType.EDIT_FORM))
            .withFormField(new QFieldMetaData("greetingName", QFieldType.STRING)
               .withIsRequired(true))
            .withComponent(new NoCodeWidgetFrontendComponentMetaData()
               .withOutput(new WidgetHtmlLine()
                  .withCondition(new QFilterCriteria("showResults", QCriteriaOperator.EQUALS, true))
                  .withVelocityTemplate("<b>Greeting:</b> $greetingResult"))
            )
         )

         ////////////////////////////////////////
         // Step 2: Backend — runs the greeting //
         ////////////////////////////////////////
         .withStep(new QBackendStepMetaData()
            .withName("runGreeter")
            .withCode(new QCodeReference(PersonGreeterBackendStep.class))
            .withInputData(new QFunctionInputMetaData()
               .withFieldList(List.of(
                  new QFieldMetaData("greetingName", QFieldType.STRING)
               )))
         )

         //////////////////////////////////////////////////////////////////////////////////
         // Step 3: Frontend — empty preview step (required by process widget pattern)   //
         //////////////////////////////////////////////////////////////////////////////////
         .withStep(new QFrontendStepMetaData()
            .withName("preview"));
   }

}
