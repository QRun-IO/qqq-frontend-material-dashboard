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


import java.time.LocalDate;
import java.util.List;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizerInterface;
import com.kingsrook.qqq.backend.core.actions.customizers.TableCustomizers;
import com.kingsrook.qqq.backend.core.actions.dashboard.widgets.AbstractWidgetRenderer;
import com.kingsrook.qqq.backend.core.actions.tables.InsertAction;
import com.kingsrook.qqq.backend.core.exceptions.QException;
import com.kingsrook.qqq.backend.core.model.actions.tables.QueryOrGetInputInterface;
import com.kingsrook.qqq.backend.core.model.actions.tables.insert.InsertInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetInput;
import com.kingsrook.qqq.backend.core.model.actions.widgets.RenderWidgetOutput;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.CompositeWidgetData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.WidgetType;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.blocks.base.BaseStyles;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.blocks.icon.IconBlockData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.blocks.icon.IconValues;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.blocks.text.TextBlockData;
import com.kingsrook.qqq.backend.core.model.dashboard.widgets.blocks.text.TextValues;
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
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.lib.QBaseSeleniumWithQApplicationTest;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.MemoryBackendProducer;
import com.kingsrook.qqq.frontend.materialdashboard.seleniumwithqapplication.metadata.PeopleAppProducer;
import org.junit.jupiter.api.Test;


/*******************************************************************************
 * Tests for some new features being added together:
 * 1) virtual field on a table
 * 2) used in an alternative section
 * 3) rendered as a widget on the view screen
 *******************************************************************************/
public class VirtualFieldInAlternativeSectionViewedAsWidgetIT extends QBaseSeleniumWithQApplicationTest
{
   private static final String TABLE_NAME = "tableWithVirtualFieldInAlternativeSectionViewedAsWidget";



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void customizeQInstance(QInstance qInstance) throws QException
   {
      QWidgetMetaData widget = new QWidgetMetaData()
         .withName("genericCompositeWidget")
         .withType(WidgetType.COMPOSITE.getType())
         .withCodeReference(new QCodeReference(NoopWidgetRenderer.class));
      qInstance.addWidget(widget);

      QTableMetaData table = new QTableMetaData()
         .withName(TABLE_NAME)
         .withBackendName(MemoryBackendProducer.NAME)
         .withRecordLabelFormatAndFields("%s", "name")
         .withField(new QFieldMetaData("id", QFieldType.INTEGER).withIsEditable(false))
         .withField(new QFieldMetaData("name", QFieldType.STRING).withIsRequired(true))
         .withField(new QFieldMetaData("type", QFieldType.STRING))
         .withField(new QFieldMetaData("homeTown", QFieldType.STRING))
         .withField(new QFieldMetaData("createDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withField(new QFieldMetaData("modifyDate", QFieldType.DATE_TIME).withIsEditable(false))
         .withSection(new QFieldSection("identity", new QIcon(), Tier.T1, List.of("id", "name", "homeTown"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setFieldNames(List.of("mergedField", "homeTown"))))
         .withSection(new QFieldSection("hidden", new QIcon(), Tier.T2, List.of("type"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.setIsHidden(true)))
         .withSection(new QFieldSection("dates", new QIcon(), Tier.T3, List.of("createDate", "modifyDate"))
            .withAlternative(QFieldSectionAlternativeType.RECORD_VIEW, (s) -> s.getFieldNames().add(0, "currentDate")))
         .withPrimaryKeyField("id");

      table.withVirtualField(new QVirtualFieldMetaData("mergedField", QFieldType.STRING)
         .withFieldAdornment(new FieldAdornment().withType(AdornmentType.WIDGET)
            .withValue(AdornmentType.WidgetValues.WIDGET_NAME, widget.getName())));

      table.withVirtualField(new QVirtualFieldMetaData("currentDate", QFieldType.DATE));

      table.withCustomizer(TableCustomizers.POST_QUERY_RECORD, new QCodeReference(TableCustomizer.class));

      qInstance.addTable(table);
      PeopleAppProducer.addTableToGreetingsApp(qInstance, table.getName());
   }



   /***************************************************************************
    *
    ***************************************************************************/
   @Override
   protected void setupTestData() throws QException
   {
      new InsertAction().execute(new InsertInput(TABLE_NAME).withRecord(new QRecord()
         .withValue("id", 1)
         .withValue("name", "Homer")
         .withValue("type", "Cartoon")
         .withValue("homeTown", "Springville")
      ));

   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class NoopWidgetRenderer extends AbstractWidgetRenderer
   {
      /***************************************************************************
       **
       ***************************************************************************/
      @Override
      public RenderWidgetOutput render(RenderWidgetInput input) throws QException
      {
         return null;
      }
   }



   /***************************************************************************
    *
    ***************************************************************************/
   public static class TableCustomizer implements TableCustomizerInterface
   {
      /***************************************************************************
       *
       ***************************************************************************/
      @Override
      public List<QRecord> postQuery(QueryOrGetInputInterface queryInput, List<QRecord> records)
      {
         for(QRecord record : records)
         {
            CompositeWidgetData widgetData = new CompositeWidgetData().withLayout(CompositeWidgetData.Layout.FLEX_ROW_WRAPPED)
               .withStyles(new BaseStyles().withPadding(BaseStyles.Directional.ofY("8")))
               .withBlocks(List.of(
                  new IconBlockData().withValues(new IconValues().withName("gavel")),
                  new TextBlockData().withValues(new TextValues(record.getValueString("id") + "|" + record.getValueString("name") + "|" + record.getValueString("type")))
               ));

            record.setValue("mergedField", widgetData);

            record.setValue("currentDate", LocalDate.parse("2025-12-09"));
         }
         return records;
      }
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void test()
   {
      qSeleniumLib.gotoAndWaitForBreadcrumbHeaderToContain("/peopleApp/greetingsApp/" + TABLE_NAME + "/1", "Homer");

      qSeleniumLib.waitForSelectorContaining(".material-icons-round", "gavel");
      qSeleniumLib.waitForSelectorContaining(".compositeWidget", "1|Homer|Cartoon");

      qSeleniumLib.waitForSelectorContaining(".sidebar-section", "Identity");
      qSeleniumLib.waitForSelectorContainingToNotExist(".sidebar-section", "Hidden");
      qSeleniumLib.waitForSelectorContaining(".sidebar-section", "Dates");

      qSeleniumLib.waitForSelectorContainingToNotExist("h6", "Hidden");
      qSeleniumLib.waitForSelectorContaining("h6", "Dates");

      qfmdSeleniumLib.waitForViewScreenFieldValue("Home Town", "Springville");
      qfmdSeleniumLib.waitForViewScreenFieldValue("Current Date", "2025-12-09");

      // qSeleniumLib.waitForever();
   }

}
