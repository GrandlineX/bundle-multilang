import * as Path from 'path';
import {
    createFolderIfNotExist,
    setupDevKernel, TestContext,
    TestKernel,
} from '@grandlinex/core';
import LangModule, {LangClient} from "../src";

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

const pathToTranslation=Path.join(__dirname,"res");
const defaultLangKey="en";

createFolderIfNotExist(msiPath);
createFolderIfNotExist(testPath);
const [kernel] = TestContext.getEntity(
    {
        kernel:new TestKernel(appName, appCode, testPath, __dirname),
        cleanUpPath: testPath
    }
);
const store = kernel.getConfigStore();
store.set(LangClient.STORE_TRANSLATION_PATH,pathToTranslation)

kernel.addModule(new LangModule(kernel,defaultLangKey));

setupDevKernel(kernel);

describe('Clean start', () => {
    test('preload', async () => {
        expect(kernel.getState()).toBe('init');
    });
    test('start kernel', async () => {
        const result = await kernel.start();
        expect(result).toBe(true);
        expect(kernel.getModCount()).toBe(3);
        expect(kernel.getState()).toBe('running');
    });
});
require('@grandlinex/core/dist/dev/lib/core');

describe('TestDatabase', () => {

  test('get version', async () => {
    const db = kernel.getChildModule("testModule")?.getDb();
    const conf = await db?.getConfig('dbversion');
    expect(conf?.c_value).not.toBeNull();
  });
})

 describe("MultiLang", ()=>{
   const mod= kernel.getChildModule("lang") as LangModule
    test("lang key in db",async ()=>{
      expect(await kernel.getDb().configExist(LangClient.DEFAULT_LANG_DB_KEY)).toBeTruthy()
      const config=await kernel.getDb()?.getConfig(LangClient.DEFAULT_LANG_DB_KEY);
      expect(config).not.toBeNull();
      expect(config?.c_value).toBe("en")
    })
   test("validate language",async ()=>{
      const client = mod.getClient()  as LangClient;

      expect(await client.getDbLang()).toBe("en");

      expect(client.hasLang("en")).toBeTruthy()
      expect(client.hasLang("de")).toBeTruthy()
      expect(client.hasLang("fr")).toBeFalsy()

     const list  = client.getLangList()
     expect(list.length).toBe(2);

     expect(await client.getDefault()).not.toBeUndefined();

   })
   test("translator",async ()=>{
     const client = mod.getClient()  as LangClient;
     const t= await client.getCurTranslator();
     expect(t.get("test.key.first")).toBe("helloWorldEn")
     expect(t.get("test.key.second")).toBe("helloWorldEn2")
     expect(t.get("test.key.third")).toBe("test.key.third")
   })
   test("translator clear",async ()=>{
     const client = mod.getClient()  as LangClient;
     const t= await client.getCurTranslator();
     t.clear()
     expect(t.get("test.key.first")).toBe("test.key.first")
     expect(t.get("test.key.second")).toBe("test.key.second")
     expect(t.get("test.key.third")).toBe("test.key.third")
   })
 })


require('@grandlinex/core/dist/dev/lib/end');
