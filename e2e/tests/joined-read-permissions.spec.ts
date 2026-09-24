import {test, expect, Page} from "@playwright/test";
import {readFileSync} from "fs";
import path from "path";

/** First-party HTTP fixtures exercise browser request and error behavior; backend authorization is tested separately. */
async function configure(page: Page, bridgeReadable = false, denyCount = false, denyQuery = false)
{
   const fixture = (name: string) => JSON.parse(readFileSync(path.resolve(__dirname, "../../src/test/resources/fixtures", name), "utf8"));
   const global = fixture("metaData/index.json");
   const person = fixture("qqq/v1/metaData/table/person.json");
   const toy = {name: "toy", label: "Toy", primaryKeyField: "id", readPermission: true, insertPermission: true,
      fields: {name: {name: "name", label: "Toy name", type: "STRING"}}};
   global.tables.pet = {name: "pet", label: "Pet", readPermission: bridgeReadable, insertPermission: true};
   global.tables.toy = {...toy};
   person.exposedJoins = [{label: "Toys", isMany: true, joinTable: toy, joinPath: [
      {name: "personPet", leftTable: "person", rightTable: "pet", type: "ONE_TO_MANY"},
      {name: "toyPet", leftTable: "toy", rightTable: "pet", type: "MANY_TO_ONE"}
   ]}];
   const queryInputs: any[] = [];
   const countInputs: any[] = [];
   const errors: string[] = [];
   page.on("pageerror", error => errors.push(error.message));
   await page.route(/\/metaData\/?(?:\?.*)?$/, route => route.fulfill({json: global}));
   await page.route("**/metaData/table/person*", route => route.fulfill({json: person}));
   await page.route("**/qqq/v1/table/person/query*", async route =>
   {
      queryInputs.push(route.request().postDataJSON());
      if (denyQuery) await route.fulfill({status: 403, json: {error: "Permission denied."}});
      else
      {
         // Complete the successful Query after the denied Count is already displayed.
         if (denyCount) await page.getByRole("alert").filter({hasText: "Cannot count records:"}).waitFor();
         await route.continue();
      }
   });
   await page.route("**/qqq/v1/table/person/count*", async route =>
   {
      countInputs.push(route.request().postDataJSON());
      if (denyCount) await route.fulfill({status: 403, json: {error: "Permission denied."}});
      else await route.continue();
   });
   return {queryInputs, countInputs, errors};
}

test("restricted bridge stays out of automatic requests and field choices", async ({page}) =>
{
   const {queryInputs, countInputs, errors} = await configure(page);
   await page.goto("/peopleApp/greetingsApp/person");
   await expect.poll(() => queryInputs.length).toBeGreaterThan(0);
   await expect.poll(() => countInputs.length).toBeGreaterThan(0);
   await expect(page.getByRole("cell", {name: "Test", exact: true})).toBeVisible();
   expect(queryInputs.every(input => !input.joins?.some((join: any) => join.joinTable === "toy"))).toBe(true);
   expect(countInputs.every(input => !input.joins?.some((join: any) => join.joinTable === "toy"))).toBe(true);
   await page.locator('[data-qqq-id="button-columns"]').click();
   await expect(page.locator(".fieldListMenuBody-columns")).toBeVisible();
   await expect(page.locator(".fieldListMenuBody-columns")).not.toContainText("Toy name");
   expect(errors).toEqual([]);
});

test("readable bridge restores query choices and selected joins", async ({page}) =>
{
   const {queryInputs, errors} = await configure(page, true);
   await page.goto("/peopleApp/greetingsApp/person");
   await expect.poll(() => queryInputs.length).toBeGreaterThan(0);
   await page.locator('[data-qqq-id="button-columns"]').click();
   await page.locator(".fieldListMenuBody-columns").getByText("Toy name", {exact: true}).click();
   await expect.poll(() => queryInputs.some(input => input.joins?.some((join: any) => join.joinTable === "toy"))).toBe(true);
   expect(errors).toEqual([]);
});

test("denied Count remains visible after successful record loading", async ({page}) =>
{
   const {queryInputs, countInputs, errors} = await configure(page, false, true);
   await page.goto("/peopleApp/greetingsApp/person");
   await expect.poll(() => queryInputs.length).toBeGreaterThan(0);
   await expect.poll(() => countInputs.length).toBeGreaterThan(0);
   await expect(page.getByRole("cell", {name: "Test", exact: true})).toBeVisible();
   await expect(page.getByRole("alert").filter({hasText: "Cannot count records:"})).toBeVisible();
   expect(errors).toEqual([]);
});

test("saved denied criteria and ordering are retained and show an error", async ({page}) =>
{
   const {queryInputs, countInputs, errors} = await configure(page, false, true, true);
   const filter = {criteria: [{fieldName: "toy.name", operator: "EQUALS", values: ["restricted"]}], orderBys: [{fieldName: "toy.name", isAscending: true}]};
   await page.goto("/peopleApp/greetingsApp/person?filter=" + encodeURIComponent(JSON.stringify(filter)));
   await expect.poll(() => queryInputs.length).toBeGreaterThan(0);
   await expect.poll(() => countInputs.length).toBeGreaterThan(0);
   expect(queryInputs[0].filter.criteria).toEqual(filter.criteria);
   expect(queryInputs[0].filter.orderBys).toEqual(filter.orderBys);
   expect(countInputs[0].filter.criteria).toEqual(filter.criteria);
   await expect(page.getByRole("alert").filter({hasText: "Permission denied."}).first()).toBeVisible();
   expect(errors).toEqual([]);
});
