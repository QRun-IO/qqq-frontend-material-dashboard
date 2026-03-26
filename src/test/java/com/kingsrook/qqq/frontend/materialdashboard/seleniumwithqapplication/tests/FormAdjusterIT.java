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


import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.AbstractWidgetRenderer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.context.QContext;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetOutput;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.FilterAndColumnsSetupData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;
import com.kingsrook.qqq.backend.core.model.data.QRecord;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.backend.core.model.metadata.code.QCodeReference;
import com.kingsrook.qqq.backend.core.model.metadata.dashboard.QWidgetMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.fields.QFieldType;
import com.kingsrook.qqq.backend.core.model.metadata.layout.QIcon;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QFieldSection;
import com.kingsrook.qqq.backend.core.model.metadata.tables.QTableMetaData;
import com.kingsrook.qqq.backend.core.model.metadata.tables.Tier;
import com.kingsrook.qqq.backend.core.utils.ValueUtils;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterInput;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterInterface;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterOutput;
import com.kingsrook.qqq.frontend.materialdashboard.actions.formadjuster.FormAdjusterOutputBuilder;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardFieldMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.MaterialDashboardTableMetaData;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;


/*******************************************************************************
 * Tests for FromAdjuster mechanism (both on-laod and on-change, hiding and showing
 * fields and sections).
 *******************************************************************************/
public class FormAdjusterIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME = "tableWithFormAdjuster";

   public static final String  MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_NAME  = "may-not-edit-custom";
   public static final String  MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_NAME = "may-not-edit-generic";
   public static final Integer MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_ID    = 1;
   public static final Integer MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_ID   = 2;


   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      QWidgetMetaData widget = new QWidgetMetaData()
         .withName("someFilterWidget")
         .withLabel("Filter")
         .withIsCard(true)
         .withType(WidgetType.FILTER_AND_COLUMNS_SETUP.getType())
         .withCodeReference(new QCodeReference(FilterWidgetRenderer.class));
      qInstance.addWidget(widget);

      QTableMetaData table = new QTableMetaData()
         .withName(TABLE_NAME)
         .withBackendName(MemoryBackendProducer.NAME)
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData("type", QFieldType.STRING))
         .withField(new QFieldMetaData("size", QFieldType.INTEGER))
         .withField(new QFieldMetaData("createDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withField(new QFieldMetaData("modifyDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name")))
         .withSection(new QFieldSection("data", new QIcon(), Tier.T2, List.of("type", "size")))
         .withSection(new QFieldSection("filter", new QIcon(), Tier.T2).withWidgetName(widget.getName()))
         .withSection(new QFieldSection("dates", new QIcon(), Tier.T3, List.of("createDate", "modifyDate")))
         .withPrimaryKeyField("id");

      MaterialDashboardTableMetaData.ofOrWithNew(table)
         .withOnLoadFormAdjuster(new QCodeReference(TableAdjuster.class));
      QFieldMetaData nameField = table.getField("name");
      nameField.withSupplementalMetaData(new MaterialDashboardFieldMetaData()
         .withFormAdjusterIdentifier("table:" + TABLE_NAME + ";field:" + nameField.getName())
         .withOnChangeFormAdjuster(new QCodeReference(TableAdjuster.class)));

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(TABLE_NAME).withRecords(List.of(
         new QRecord().withValue("id", MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_ID).withValue("name", MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_NAME),
         new QRecord().withValue("id", MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_ID).withValue("name", MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_NAME)
      )));
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class TableAdjuster implements FormAdjusterInterface
   {
      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public FormAdjusterOutput execute(FormAdjusterInput input) throws QException
      {
         if(MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_NAME.equals(input.getFieldValue("name")))
         {
            return (new FormAdjusterOutput().withIsFormDisabled(true).withFormDisabledMessage("No soup for you."));
         }
         else if(MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_NAME.equals(input.getFieldValue("name")))
         {
            return (new FormAdjusterOutput().withIsFormDisabled(true));
         }

         Set<String> names = Collections.emptySet();
         if("name".equals(input.getFieldName()))
         {
            names = Stream.of(Objects.requireNonNullElse(ValueUtils.getValueAsString(input.getNewValue()), "").split(" ")).collect(Collectors.toSet());
         }

         boolean showFilterSection = names.contains("filter");
         boolean showTypeField     = names.contains("type");
         boolean showSizeField     = names.contains("size");

         FormAdjusterOutputBuilder outputBuilder = new FormAdjusterOutputBuilder(TABLE_NAME);
         outputBuilder.makeFieldShownIf("type", showTypeField);
         outputBuilder.makeFieldShownIf("size", showSizeField);

         FormAdjusterOutput output = outputBuilder.build();

         QTableMetaData tableMetaData                 = QContext.getQInstance().getTable(TABLE_NAME);
         QFieldSection  resyncOmsScheduleSectionClone = tableMetaData.getSection("filter").clone();
         resyncOmsScheduleSectionClone.setIsHidden(!showFilterSection);
         output.setUpdatedSectionMetaData(Map.of(resyncOmsScheduleSectionClone.getName(), resyncOmsScheduleSectionClone));

         return output;
      }
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
         return (new RenderWidgetOutput(new FilterAndColumnsSetupData(TABLE_NAME, false, true, null)));
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void test()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/create", "Creating New");

      /////////////////////////////////////////////////////////////////////
      // by default the form adjuster will hide data and filter sections //
      /////////////////////////////////////////////////////////////////////
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Data");
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Filter");
      assertSidebar(List.of("Identity", "Dates"));

      qfmdSeleniumLib.inputTextField("name", "filter");
      qSeleniumLib.waitForSelectorContaining("h5", "Creating New").click(); // blur the text field to trigger the on-change
      qfmdSeleniumLib.blurByClickingBlankSpace();
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Data");
      qSeleniumLib.waitForSelectorContaining("h6", "Filter");
      assertSidebar(List.of("Identity", "Filter", "Dates"));

      qfmdSeleniumLib.inputTextField("name", " type");
      qfmdSeleniumLib.blurByClickingBlankSpace();
      qSeleniumLib.waitForSelectorContaining("h6", "Data");
      qSeleniumLib.waitForSelectorContaining("h6", "Filter");
      assertSidebar(List.of("Identity", "Data", "Filter", "Dates"));

      ////////////////////////////////////////////////////////////
      // put a value in the 'type' field.  then make it go away //
      ////////////////////////////////////////////////////////////
      qfmdSeleniumLib.inputTextField("type", "a value");
      WebElement nameInput = qfmdSeleniumLib.inputTextField("name", "x"); // put an 'x' after type, so it doesn't match in the adjuster and it goes away
      qfmdSeleniumLib.blurByClickingBlankSpace();
      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Data");

      ///////////////////////////////////////////////////////////////
      // make the field come back and assert value stayed the same //
      ///////////////////////////////////////////////////////////////
      qfmdSeleniumLib.inputTextField("name").sendKeys(Keys.BACK_SPACE);
      qfmdSeleniumLib.blurByClickingBlankSpace();
      qSeleniumLib.waitForSelectorContaining("h6", "Data");
      qSeleniumLib.waitForSeconds(1);
      assertEquals("a value", qfmdSeleniumLib.inputTextField("type").getAttribute("value"));
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testDisablingForm()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/" + MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_ID + "/edit", "" + MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_ID);
      qSeleniumLib.waitForSelectorContaining("h5", "Editing Table With Form Adjuster: " + MAY_NOT_EDIT_WITH_CUSTOM_MESSAGE_ID);
      qfmdSeleniumLib.waitForAlert("No soup for you.");
      assertThatThrownBy(() -> qfmdSeleniumLib.inputTextField("size", "XL"));
      qSeleniumLib.waitForSelectorContaining("button[disabled]", "save");

      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/" + MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_ID + "/edit", "" + MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_ID);
      qSeleniumLib.waitForSelectorContaining("h5", "Editing Table With Form Adjuster: " + MAY_NOT_EDIT_WITH_DEFAULT_MESSAGE_ID);
      qfmdSeleniumLib.waitForAlert("You are not allowed to edit this record");
      qSeleniumLib.waitForSelectorContaining("button[disabled]", "save");
   }



   /***************************************************************************
    *
    ***************************************************************************/
   void assertSidebar(List<String> expectedSectionLabels)
   {
      List<WebElement> sidebarSections = qSeleniumLib.waitForSelectorAll(".sidebar-section.is-visible", 1);
      assertEquals(expectedSectionLabels.size(), sidebarSections.size());
      for(int i = 0; i < expectedSectionLabels.size(); i++)
      {
         assertThat(sidebarSections.get(i).getText()).contains(expectedSectionLabels.get(i));
      }
   }

}
