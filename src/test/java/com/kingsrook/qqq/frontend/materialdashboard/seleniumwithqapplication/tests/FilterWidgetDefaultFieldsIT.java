/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
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

package com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.tests;


import java.util.List;
import java.util.Map;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizerInterface;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizers;
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.AbstractWidgetRenderer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.QueryOrGetInputInterface;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetOutput;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.FilterAndColumnsSetupData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.AdornmentType;
import com.kingsrook.qqq.backend.core.model.metadata.fields.FieldAdornment;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QVirtualFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSectionAlternativeType;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.frontend.materialdashboard.selenium.lib.QueryScreenLib;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PersonTableProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetSpeciesPVSProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PetTableProducer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 * Tests for using a filter widget that requires another field on the record
 * to have a value selected before the filter can be edited.
 *
 * In the first case (testTableWithFieldNameMatchingFilterTableFieldName) the
 * field is named the same ("speciesId") in both tables.
 *
 * A second use-case (testTableWithFieldNameNotMatchingFilterTableFieldName)
 * handles the field name between the table being filtered and the base table
 * having different names (because at one point, they had to be the same).
 *******************************************************************************/
public class FilterWidgetDefaultFieldsIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME = "tableWithFilterField";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      customizeQInstanceViaTestMethodTagSpecifyingCustomizeQInstanceMethodName(qInstance);
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void doCustomizeQInstance(QInstance qInstance, String thisTableSpeciesIdFieldName) throws QException
   {
      QWidgetMetaData widget = new QWidgetMetaData()
         .withName("petFilterWidget")
         .withLabel("Pet Filter")
         .withIsCard(false)
         .withType(WidgetType.FILTER_AND_COLUMNS_SETUP.getType())
         .withCodeReference(new QCodeReference(thisTableSpeciesIdFieldName.equals("speciesId") ? FilterWidgetRenderer.class : FilterWidgetRendererForNonMatchingName.class));
      qInstance.addWidget(widget);

      QTableMetaData table = new QTableMetaData()
         .withName(TABLE_NAME)
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData(thisTableSpeciesIdFieldName, QFieldType.INTEGER).withIsRequired(true)
            .withPossibleValueSourceName(PetSpeciesPVSProducer.NAME))
         .withField(new QFieldMetaData("filterJSON", QFieldType.STRING).withLabel("Person Filter")
            .withGridColumns(12)
            .withFieldAdornment(new FieldAdornment(AdornmentType.WIDGET)
               .withValue(AdornmentType.WidgetValues.WIDGET_NAME, widget.getName())))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name", thisTableSpeciesIdFieldName)))
         .withSection(new QFieldSection("filter", new QIcon(), Tier.T2, List.of("filterJSON"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setFieldNames(List.of("filterVirtual"))))
         .withVirtualField(new QVirtualFieldMetaData("filterVirtual", QFieldType.STRING).withLabel("Person Filter"))
         .withPrimaryKeyField("id")
         .withCustomizer(TableCustomizers.POST_QUERY_RECORD, new QCodeReference(TableCustomizer.class));

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(PersonTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("firstName", "Darin").withValue("lastName", "Kelkhoff"),
         new QRecord().withValue("firstName", "Jean-Luc").withValue("lastName", "Picard")
      )));

      new InsertAction().execute(new InsertInput(PetTableProducer.NAME).withRecords(List.of(
         new QRecord().withValue("name", "Santa's Little Helper").withValue("speciesId", PetSpeciesPVSProducer.Value.DOG.getPossibleValueId()),
         new QRecord().withValue("name", "Snowball II").withValue("speciesId", PetSpeciesPVSProducer.Value.CAT.getPossibleValueId())
      )));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class FilterWidgetRenderer extends AbstractWidgetRenderer
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      @Override
      public RenderWidgetOutput render(RenderWidgetInput input) throws QException
      {
         FilterAndColumnsSetupData filterAndColumnsSetupData = new FilterAndColumnsSetupData(PetTableProducer.NAME, false, true, List.of("speciesId"));
         return (new RenderWidgetOutput(filterAndColumnsSetupData));
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class FilterWidgetRendererForNonMatchingName extends AbstractWidgetRenderer
   {
      /*******************************************************************************
       **
       *******************************************************************************/
      @Override
      public RenderWidgetOutput render(RenderWidgetInput input) throws QException
      {
         FilterAndColumnsSetupData filterAndColumnsSetupData = new FilterAndColumnsSetupData(PetTableProducer.NAME, false, true, List.of("speciesId"));
         filterAndColumnsSetupData.setFilterDefaultFieldNameSourceFieldNames(Map.of("speciesId", "whatSpecies"));
         return (new RenderWidgetOutput(filterAndColumnsSetupData));
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class TableCustomizer implements TableCustomizerInterface
   {
      @Override
      public List<QRecord> postQuery(QueryOrGetInputInterface queryInput, List<QRecord> records) throws QException
      {
         for(QRecord record : records)
         {
            record.setValue("filterVirtual", record.getValueString("filterJSON"));
         }

         return (records);
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForTableWithFieldNameMatchingFilterTableFieldName(QInstance qInstance) throws QException
   {
      doCustomizeQInstance(qInstance, "speciesId");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForTableWithFieldNameMatchingFilterTableFieldName")
   void testTableWithFieldNameMatchingFilterTableFieldName()
   {
      runTest("speciesId", "Species");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public void customizeQInstanceForTableWithFieldNameNotMatchingFilterTableFieldName(QInstance qInstance) throws QException
   {
      doCustomizeQInstance(qInstance, "whatSpecies");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   @Tag("customizeQInstanceForTableWithFieldNameNotMatchingFilterTableFieldName")
   void testTableWithFieldNameNotMatchingFilterTableFieldName()
   {
      runTest("whatSpecies", "whatSpecies");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   private void runTest(String speciesIdFieldName, String speciesFieldLabel)
   {
      QueryScreenLib queryScreenLib = new QueryScreenLib(qSeleniumLib);

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/create", "Creating New");

      qSeleniumLib.waitForSelectorContaining("button", "Edit Filters").click();
      qfmdSeleniumLib.waitForAlert("The following fields must first be selected to edit the filter: '" + speciesFieldLabel + "'");
      qfmdSeleniumLib.closeAlert();

      qfmdSeleniumLib.inputDynamicSelectOption(speciesIdFieldName, "Dog");
      qSeleniumLib.waitForSelectorContaining(".advancedQueryString", "Species equals Dog");
      qSeleniumLib.waitForSelectorContaining("button", "Edit Filters").click();

      qfmdSeleniumLib.waitForDataGridContent("Santa's Little Helper");
      qfmdSeleniumLib.waitForDataGridContentToNotExist("Snowball");

      queryScreenLib.setBasicFilter("Name", "starts with", "S");
      qfmdSeleniumLib.clickOkButton();

      // qSeleniumLib.waitForever();
   }

}
