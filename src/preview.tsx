import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate,
} from 'react-router-dom'
import { Loading, Shell, Search, Nav } from '@alifd/next';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { buildComponents, assetBundle, AssetLevel, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import appHelper from './appHelper';
import { getProjectSchemaFromLocalStorage, getPackagesFromLocalStorage, getPreviewLocale, setPreviewLocale, getResourceListFromLocalStorage } from './services/mockService';
import { default as PortalRender } from './renderer';


const getScenarioName = function () {
  if (location.search) {
    return new URLSearchParams(location.search.slice(1)).get('scenarioName') || 'general';
  }
  return 'general';
}

const SamplePreview = () => {
  const [data, setData] = useState({});

  const [activeNav, setActiveNav] = useState()

  const scenarioName = getScenarioName();

  const params = useParams();
  const navigate = useNavigate();
  
  const {page} = params;

  console.log('SamplePreview==== start ====, page:  ', page)

  useEffect(() => {
    async function getData() {
      console.log('in preview effect========');
      const resourceList = await getResourceListFromLocalStorage(scenarioName);
      if (!page && resourceList?.length) {
        navigate(`${resourceList[0]?.id || ''}`)
      }
      setData({
        resourceList,
      });
    }
    getData();
  }, []);
  // setActiveNav(`${page}`);
  // async function init() {
  //   console.log('SamplePreview init funciton ========')
  //   const resourceList = await getResourceListFromLocalStorage(scenarioName);
  //   if (!page && resourceList?.length) {
  //     navigate(`${resourceList[0]?.id || ''}`);
  //   }

  //   const id = page || resourceList?.[0].id;
  //   const packages = getPackagesFromLocalStorage(scenarioName, id);
  //   const projectSchema = getProjectSchemaFromLocalStorage(scenarioName, id);
  //   const {
  //     componentsMap: componentsMapArray,
  //     componentsTree,
  //     i18n,
  //     dataSource: projectDataSource,
  //   } = projectSchema;
  //   const componentsMap: any = {};
  //   componentsMapArray.forEach((component: any) => {
  //     componentsMap[component.componentName] = component;
  //   });
  //   const pageSchema = componentsTree[0];

  //   const libraryMap = {};
  //   const libraryAsset = [];
  //   packages.forEach(({ package: _package, library, urls, renderUrls }) => {
  //     libraryMap[_package] = library;
  //     if (renderUrls) {
  //       libraryAsset.push(renderUrls);
  //     } else if (urls) {
  //       libraryAsset.push(urls);
  //     }
  //   });

  //   const vendors = [assetBundle(libraryAsset, AssetLevel.Library)];

  //   // TODO asset may cause pollution
  //   const assetLoader = new AssetLoader();
  //   await assetLoader.load(libraryAsset);
  //   const components = await injectComponents(buildComponents(libraryMap, componentsMap));

  //   try {
  //     setSchema(pageSchema);

  //   } catch (e) {
  //     console.log('exception', e)
  //   }

  //   console.log('id2', id, resourceList);
  //   setActiveNav(id);

  //   setData({
  //     // schema: pageSchema,
  //     components,
  //     i18n,
  //     projectDataSource,
  //     resourceList,
  //   });
  // }


  // const { components, i18n = {}, projectDataSource = {} } = data as any;

  // if (!schema || !components) {
  //   init();
  //   return <Loading fullScreen />;
  // } else {
  //   console.log('not init========')
  //   const aaa = getProjectSchemaFromLocalStorage(scenarioName, `${page}`);
  //   console.log('old schema is: ', schema);
  //   console.log('new schema is : ', aaa?.componentsTree[0])
  //   try {
  //     setSchema(aaa?.componentsTree[0]);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   console.log('after set')
  //   // setActiveNav(page);
  // }

  // const currentLocale = getPreviewLocale(getScenarioName());

  // if (!(window as any).setPreviewLocale) {
  //   // for demo use only, can use this in console to switch language for i18n test
  //   // 在控制台 window.setPreviewLocale('en-US') 或 window.setPreviewLocale('zh-CN') 查看切换效果
  //   (window as any).setPreviewLocale = (locale:string) => setPreviewLocale(getScenarioName(), locale);
  // }

  // function customizer(objValue: [], srcValue: []) {
  //   if (isArray(objValue)) {
  //     return objValue.concat(srcValue || []);
  //   }
  // }

  console.log('activeNav====', activeNav);

  return (
    <div className="lowcode-plugin-sample-preview">
      <Shell
        className={"iframe-hack"}
        device="desktop"
        style={{ border: "1px solid #eee" }}
      >
        <Shell.Branding>
          <div className="rectangular"></div>
          <span style={{ marginLeft: 10 }}>App Name</span>
        </Shell.Branding>
        <Shell.Navigation direction="hoz">
          <Search
            key="2"
            shape="simple"
            type="dark"
            palceholder="Search"
            style={{ width: "200px" }}
          />
        </Shell.Navigation>

        <Shell.Navigation>
          <Nav
            embeddable
            aria-label="global navigation"
            selectedKeys={[page || data?.resourceList?.[0].id || '']}
          >
            {
              data?.resourceList?.map((d) => (
                <Nav.Item
                  key={d.id}
                 
                  icon="account"
                ><Link to={`/${d.id}`}>{d.title}</Link></Nav.Item>
              ))
            }
          </Nav>
        </Shell.Navigation>

        <Shell.Content>
          <div style={{ minHeight: 1200, background: "#fff" }}>
            <PortalRender page={page} /> 
          </div>
        </Shell.Content>
      </Shell>
    </div>
  );
};

ReactDOM.render(<Router>
  <Routes>
    <Route path={`/`} element={<SamplePreview />} />
    <Route path={`/:page`} element={<SamplePreview />} />
  </Routes>
</Router>, document.getElementById('ice-container'));
