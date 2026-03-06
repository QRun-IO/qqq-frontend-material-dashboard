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

package com.kingsrook.qqq.frontend.materialdashboard.model.metadata;


import java.util.List;
import java.util.function.Consumer;
import com.kingsrook.qqq.backend.core.exceptions.QInstanceValidationException;
import com.kingsrook.qqq.backend.core.instances.QInstanceValidator;
import com.kingsrook.qqq.backend.core.model.metadata.QInstance;
import com.kingsrook.qqq.frontend.materialdashboard.junit.BaseTest;
import com.kingsrook.qqq.frontend.materialdashboard.junit.TestUtils;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRule;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRuleAction;
import com.kingsrook.qqq.frontend.materialdashboard.model.metadata.fieldrules.FieldRuleTrigger;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;


/*******************************************************************************
 ** Unit test for MaterialDashboardTableMetaData
 *******************************************************************************/
class MaterialDashboardTableMetaDataTest extends BaseTest
{
   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testShowRecordSidebarDefaultsTrue()
   {
      MaterialDashboardTableMetaData tableMetaData = new MaterialDashboardTableMetaData();
      assertThat(tableMetaData.getShowRecordSidebar()).isTrue();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testShowRecordSidebarCloned()
   {
      MaterialDashboardTableMetaData tableMetaData = new MaterialDashboardTableMetaData().withShowRecordSidebar(false);
      MaterialDashboardTableMetaData clone         = (MaterialDashboardTableMetaData) tableMetaData.clone();

      assertThat(clone.getShowRecordSidebar()).isFalse();
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testRecordViewActionsPlacementDefaultsToInIdentitySection()
   {
      MaterialDashboardTableMetaData tableMetaData = new MaterialDashboardTableMetaData();
      assertThat(tableMetaData.getRecordViewActionsPlacement()).isEqualTo(MaterialDashboardTableMetaData.RecordViewActionsPlacement.IN_IDENTITY_SECTION);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testRecordViewActionsPlacementCloned()
   {
      MaterialDashboardTableMetaData tableMetaData = new MaterialDashboardTableMetaData()
         .withRecordViewActionsPlacement(MaterialDashboardTableMetaData.RecordViewActionsPlacement.INLINE_WITH_PAGE_TITLE);
      MaterialDashboardTableMetaData clone = (MaterialDashboardTableMetaData) tableMetaData.clone();

      assertThat(clone.getRecordViewActionsPlacement()).isEqualTo(MaterialDashboardTableMetaData.RecordViewActionsPlacement.INLINE_WITH_PAGE_TITLE);
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testValidateGoToFieldNames()
   {
      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withGotoFieldNames(List.of(List.of()))),
         "empty gotoFieldNames list");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withGotoFieldNames(List.of(List.of("foo")))),
         "unrecognized field name: foo");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withGotoFieldNames(List.of(List.of("foo"), List.of("bar", "baz")))),
         "unrecognized field name: foo",
         "unrecognized field name: bar",
         "unrecognized field name: baz");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withGotoFieldNames(List.of(List.of("firstName", "firstName")))),
         "duplicated field name: firstName");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testValidateQuickFilterFieldNames()
   {
      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withDefaultQuickFilterFieldNames(List.of("foo"))),
         "unrecognized field name: foo");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withDefaultQuickFilterFieldNames(List.of("firstName", "lastName", "firstName"))),
         "duplicated field name: firstName");
   }



   /*******************************************************************************
    **
    *******************************************************************************/
   @Test
   void testValidateFieldRules()
   {
      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withFieldRule(new FieldRule())),
         "without an action",
         "without a trigger",
         "without a sourceField");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withFieldRule(new FieldRule()
            .withTrigger(FieldRuleTrigger.ON_CHANGE)
            .withAction(FieldRuleAction.CLEAR_TARGET_FIELD)
            .withSourceField("notAField")
            .withTargetField("alsoNotAField")
         )),
         "unrecognized sourceField: notAField",
         "unrecognized targetField: alsoNotAField");

      assertValidationFailureReasons(qInstance -> qInstance.getTable(TestUtils.TABLE_NAME_PERSON).withSupplementalMetaData(new MaterialDashboardTableMetaData().withFieldRule(new FieldRule()
            .withTrigger(FieldRuleTrigger.ON_CHANGE)
            .withAction(FieldRuleAction.RELOAD_WIDGET)
            .withSourceField("id")
            .withTargetWidget("notAWidget")
         )),
         "unrecognized targetWidget: notAWidget");

   }

   //////////////////////////////////////////////////////////////////////////
   // todo - methods below here were copied from QInstanceValidatorTest... //
   // how to share those...                                                //
   //////////////////////////////////////////////////////////////////////////


   /*******************************************************************************
    ** Run a little setup code on a qInstance; then validate it, and assert that it
    ** failed validation with reasons that match the supplied vararg-reasons (but allow
    ** more reasons - e.g., helpful when one thing we're testing causes other errors).
    *******************************************************************************/
   private void assertValidationFailureReasonsAllowingExtraReasons(Consumer<QInstance> setup, String... reasons)
   {
      assertValidationFailureReasons(setup, true, reasons);
   }



   /*******************************************************************************
    ** Run a little setup code on a qInstance; then validate it, and assert that it
    ** failed validation with reasons that match the supplied vararg-reasons (and
    ** require that exact # of reasons).
    *******************************************************************************/
   private void assertValidationFailureReasons(Consumer<QInstance> setup, String... reasons)
   {
      assertValidationFailureReasons(setup, false, reasons);
   }



   /*******************************************************************************
    ** Implementation for the overloads of this name.
    *******************************************************************************/
   private void assertValidationFailureReasons(Consumer<QInstance> setup, boolean allowExtraReasons, String... reasons)
   {
      try
      {
         QInstance qInstance = TestUtils.defineInstance();
         setup.accept(qInstance);
         new QInstanceValidator().validate(qInstance);
         fail("Should have thrown validationException");
      }
      catch(QInstanceValidationException e)
      {
         if(!allowExtraReasons)
         {
            int noOfReasons = e.getReasons() == null ? 0 : e.getReasons().size();
            assertEquals(reasons.length, noOfReasons, "Expected number of validation failure reasons.\nExpected reasons: " + String.join(",", reasons)
               + "\nActual reasons: " + (noOfReasons > 0 ? String.join("\n", e.getReasons()) : "--"));
         }

         for(String reason : reasons)
         {
            assertReason(reason, e);
         }
      }
   }



   /*******************************************************************************
    ** Assert that an instance is valid!
    *******************************************************************************/
   private void assertValidationSuccess(Consumer<QInstance> setup)
   {
      try
      {
         QInstance qInstance = TestUtils.defineInstance();
         setup.accept(qInstance);
         new QInstanceValidator().validate(qInstance);
      }
      catch(QInstanceValidationException e)
      {
         fail("Expected no validation errors, but received: " + e.getMessage());
      }
   }



   /*******************************************************************************
    ** utility method for asserting that a specific reason string is found within
    ** the list of reasons in the QInstanceValidationException.
    **
    *******************************************************************************/
   private void assertReason(String reason, QInstanceValidationException e)
   {
      assertNotNull(e.getReasons(), "Expected there to be a reason for the failure (but there was not)");
      assertThat(e.getReasons())
         .withFailMessage("Expected any of:\n%s\nTo match: [%s]", e.getReasons(), reason)
         .anyMatch(s -> s.contains(reason));
   }

   /////////////////////////////////////////////////////////////////
   // todo - end of methods copied from QInstanceValidatorTest... //
   /////////////////////////////////////////////////////////////////
}
