import React, { useEffect, useState } from 'react';
import { Loading } from '@alifd/next';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { ProjectSchema } from '@alilc/lowcode-types';
import { buildComponents, assetBundle, AssetLevel, AssetLoader } from '@alilc/lowcode-utils';
import mergeWith from 'lodash/mergeWith';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import isArray from 'lodash/isArray';
import appHelper from './appHelper';
import { getProjectSchemaFromLocalStorage, getPackagesFromLocalStorage, getPreviewLocale, setPreviewLocale, getResourceListFromLocalStorage } from './services/mockService';


interface PortalRendererProps {
  page?: string;
  schema?: ProjectSchema;
};

const getScenarioName = function () {
  if (location.search) {
    return new URLSearchParams(location.search.slice(1)).get('scenarioName') || 'general';
  }
  return 'general';
}

const PortalRenderer = (props: PortalRendererProps) => {
  console.log('in renderer start ======== ')
  const { page, schema: propSchema } = props;
  const scenarioName = getScenarioName();
  // const [previousSchemaUrl, setPreviousSchemaUrl] = useState(schemaUrl);
  const [data, setData] = useState({});
  const [schema, setSchema] = useState(propSchema);
  // const [components, setComponents] = useState();
  // 获取package
  // useEffect(() => {
  //   const fetchAssets = async () => {
  //     const assets = await getAssets();
  //     setAssets(assets);
  //   };
  //   fetchAssets();
  // }, []);

  // 获取 schema
  // useEffect(() => {
  //   const fetchSchema = async () => {
  //     const schema = propSchema ? propSchema : await getFullSchemaByUrl(schemaUrl);
  //     setSchema(schema);
  //   };
  //   fetchSchema();
  // }, [schemaUrl]);
  useEffect(() => {
    // if (assets && schema) {
    // setComponents(undefined);

    // 这里如果不清空 components， 点击导航重新渲染时，不会调用 componentDidMount 函数
    // 清空 components 之后， 点击导航重新渲染时，会先调用  componentWillUnmount ， 再渲染， 再调用 componentDidMount
    setData({
      components : undefined
    });
    getComponents();
    // }
  }, [page]);

  async function getComponents() {
    const resourceList = await getResourceListFromLocalStorage(scenarioName);
    const id = page || resourceList?.[0].id;
    console.log('in renderer, page: ', page);
    const packages = getPackagesFromLocalStorage(scenarioName, id);
    const projectSchema = getProjectSchemaFromLocalStorage(scenarioName, id);
    const {
      componentsMap: componentsMapArray,
      componentsTree,
      i18n,
      dataSource: projectDataSource,
    } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const pageSchema = componentsTree[0];

    // const libraryMap = {};
    // const libraryAsset = [];
    // packages.forEach(({ package: _package, library, urls, renderUrls }) => {
    //   libraryMap[_package] = library;
    //   if (renderUrls) {
    //     libraryAsset.push(renderUrls);
    //   } else if (urls) {
    //     libraryAsset.push(urls);
    //   }
    // });


    const libraryMap: {
      [packageName: string]: string;
    } = {};

    const assetLoader = new AssetLoader();

    for(let i = 0; i < packages.length; i++) {
      const { package: _package, library, urls, renderUrls, deps } = packages[i];
      libraryMap[_package] = library;
      if (renderUrls || urls) {
        await assetLoader.load(renderUrls || urls);
      }
    }

    // const vendors = [assetBundle(libraryAsset, AssetLevel.Library)];

    // TODO asset may cause pollution
    // const assetLoader = new AssetLoader();
    // await assetLoader.load(libraryAsset);


    const components = await injectComponents(buildComponents(libraryMap, componentsMap));
     // setPreviousSchemaUrl(schemaUrl);
    setSchema(pageSchema);
    // setComponents(components);
    setData({
    // schema: pageSchema,
    components,
    i18n,
    projectDataSource,
    resourceList,
  });
  }

  const currentLocale = getPreviewLocale(getScenarioName());

  if (!(window as any).setPreviewLocale) {
    // for demo use only, can use this in console to switch language for i18n test
    // 在控制台 window.setPreviewLocale('en-US') 或 window.setPreviewLocale('zh-CN') 查看切换效果
    (window as any).setPreviewLocale = (locale:string) => setPreviewLocale(getScenarioName(), locale);
  }

  function customizer(objValue: [], srcValue: []) {
    if (isArray(objValue)) {
      return objValue.concat(srcValue || []);
    }
  }

  const { components, i18n = {}, projectDataSource = {} } = data as any;

  if (!components || !schema ) {
    return <Loading fullScreen />;
  }
  return (
    <ReactRenderer
      className="lowcode-plugin-sample-preview-content"
      schema={{
        ...schema,
        dataSource: mergeWith(schema.dataSource, projectDataSource, customizer),
      }}
      components={components}
      locale={currentLocale}
      messages={i18n}
      appHelper={appHelper}
    />
  );
};

export default PortalRenderer;