import CoreKernel, {
  CoreCryptoClient,
  CoreKernelModule, ICoreCClient,
  InMemDB
} from '@grandlinex/core';
import LangModule, { LangClient } from '../src';
import * as Path from 'path';


type TCoreKernel=CoreKernel<ICoreCClient>;

class TestBaseMod extends CoreKernelModule<TCoreKernel,InMemDB,null,null,null> {
  beforeServiceStart(): Promise<void> {
    return Promise.resolve( undefined );
  }

  final(): Promise<void> {
    return Promise.resolve( undefined );
  }

  initModule(): Promise<void> {
    this.setDb(new InMemDB(this))
    return Promise.resolve( undefined );
  }

  startup(): Promise<void> {
    return Promise.resolve( undefined );
  }

}
class TestKernel extends CoreKernel<ICoreCClient> {
  static pathToTranslation=Path.join(__dirname,"res");
  static defaultLangKey="en";
  constructor(appName:string, appCode:string,testPath:string) {
    super( { appName, appCode, pathOverride:testPath });
    this.setBaseModule(new TestBaseMod("testbase2",this));


    const store = this.getConfigStore();
    store.set(LangClient.STORE_TRANSLATION_PATH,TestKernel.pathToTranslation)

    this.addModule(new LangModule(this,TestKernel.defaultLangKey));

    this.setCryptoClient(new CoreCryptoClient(CoreCryptoClient.fromPW("testpw")))
   }
}



export {
  TCoreKernel,
  TestBaseMod,
  TestKernel,
 }
