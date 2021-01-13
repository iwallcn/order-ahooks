## 1、背景： 
### GFN-供应链/库存技术团队项目是没有前后分离，采用服务器端的Java模版引擎Thymeleaf来开发前端页面，就需要依赖后端java环境，比较麻烦，不利于前端开发。
### 现预约项目采用ice框架做部分分离，技术栈：react hooks + fusion。  涉及到子系统：omp，order，forwarder三个子系统


## 2、用icejs创建前端项目：
[More docs] icejs说明文档 [https://ice.work/docs/guide/about](https://ice.work/docs/guide/about)
[More docs] ice平台官网 [https://ice.work/](https://ice.work/)
[More docs] [https://4pxgroup.yuque.com/eatfq8/mgis1f/xhvxof](https://4pxgroup.yuque.com/eatfq8/mgis1f/xhvxof)


```bash
# 创建项目
npm init ice ice-demo

# 安装依赖
$ npm install

# 启动服务
$ npm start  # visit http://localhost:3333
```


## 3、目录

```md
├── .ice/                          # 运行 icejs 项目时默认生成的临时目录，该目录不需要进行 git 提交
├── build/                         # 构建产物
├── mock/                          # 本地模拟数据
│   ├── index.[j,t]s
├── public/                        # 静态资源目录
│   ├── index.html                 # 应用入口 HTML
│   └── favicon.png                # Favicon
├── src/                           # 源码路径
│   ├── components/                # 自定义业务组件
│   │   └── Iconfont/              # 图标库  https://www.iconfont.cn/ 
│   │       ├── index.[j,t]sx
│   │       ├── index.module.scss
│   ├── contexts/                   # createContext
│   │   └── globalContext.[j,t]sx
│   ├── layouts/                   # 布局组件
│   │   └── BasicLayout/
│   ├── locales/                   # 国际化, 静态翻译文件
│   │   └── de/
│   │       ├── index.[j,t]sx
│   │   └── en/
│   │       ├── index.[j,t]sx
│   ├── models/                    # [可选] 应用级数据状态
│   │   └── basic.[j,t]s
│   ├── pages/                     # 页面
│   │   └── Home/                  # home 页面，约定路由转成小写
│   │       ├── components/        # 页面级自定义业务组件
│   │       ├── models.[j,t]sx     # 页面级数据状态
│   │       ├── index.[j,t]sx      # 页面入口
│   │       └── index.module.scss  # 页面样式文件
│   ├── utils/                     # [可选] 工具库
│   └── app.[j,t]s[x]              # 应用入口脚本 用于对应用进行全局配置，包括路由、运行环境、请求、日志等
│   ├── config.[j,t]s              # [可选] 配置文件，项目的环境配置，用于根据不同环境进行区分配置
│   ├── global.scss                # 全局样式
│   ├── routes.[j,t]s              # 路由配置
├── build.json                     # 工程配置
├── README.md
├── package.json
├── .editorconfig
├── .eslintignore
├── .eslintrc.[j,t]s
├── .gitignore
├── .stylelintignore
├── .stylelintrc.[j,t]s
├── .gitignore
└── [j,t]sconfig.json
```



## 4、开发过程中遇到问题记录如下：

```bash
#### 未分离部分和已分离部分如何融合，需要考虑到的问题如下：
#### a. 前端项目开发完成，打包之后，放到对应后端项目目录下，eg: index.html(需设置js和css路径) 存放到 resources\templates\build\index.html， 
####       其他静态文件存放到 \resources\static\build\
####       然后由前端控制的路由页面，后端controller层统一设置跳转到 resources\templates\build\index.html
#### b. 如何获取权限，菜单，个人信息
#### c. 菜单路由控制区分
#### d. 多个应用共享cookie问题
#### e. 前后如何并行开发：定义好接口，数据格式，放到YAPI上面 [http://10.104.6.108:3000/](http://10.104.6.108:3000/)，前端代理到YAPI上面mock数据


#### **1. 区分环境，构建代码和提交代码**
    在根目录下新建config.ts

    在package.json中修改
        "scripts": {
            "start": "icejs start",
            "build": "icejs build",  // 默认构建到当前项目目录下
            +"branch": "icejs build --mode branch",
            +"trunk": "icejs build --mode trunk"
            ...
        }

    在build.json中修改
        +"modeConfig": {
            "branch": {
                "outputDir": "E:/FB4/fpx-fb4-order/fpx-fb4-order-web/src/main/resources/static/build/"
            },
            "trunk": {
                "outputDir": "E:/FB4_trunk/fpx-fb4-order-web/src/main/resources/static/build/"
            }
        }

#### **2. 设置接口代理**
    在app.ts中修改
        request: {
            +baseURL: process.env.NODE_ENV === 'development' ? '/mainApi' : ''
        }
    在build.json中修改
        +"proxy": {
            "/mainApi": {
                "enable": true,
                "target": "http://order-fulfillment.test.4px.com",
                "pathRewrite": {
                    "^/mainApi": ""
                }
            }
        }

#### **3. 组件设置语言，目前只支持4种 中英繁日四种语言 zh-CN, ja-JP, en-US, zh-HK**
    在src/locales 下新增相关的静态语言包
    在src/components/LocaleProvider/index.tsx 引入基础组件的语言包

#### **4. 区分路由控制：一部分路由由前端控制，一部分路由由后端控制**
    新增routerConfig.ts 里面的路由都由前端控制
    然后在routers.ts中修改
        +import { children } from './routerConfig';
        children: [
            +...children,
        ]
    然后在PageNav/index.tsx中修改
        +import { children } from '@/routerConfig';
        +const furl: any = [];
        +for (let i in children) {
            furl.push(children[i].path);
        +}
        +let url = furl.indexOf(child.url) !== -1 ? child.url : `${window.location.origin}${child.url}`
        obj.children.push({
            name: child.name,
            +path: url,
        });

#### **5. 多个应用共享cookie问题，eg: lang**
    首先判断对内还是对外，然后再根据环境来区分，设置cookie的domain
    对内系统：采用.i4px.com
    对外系统：采用.4px.com
    参考：src/locales/locale.js

#### **6. 设置modularImportRuntime：true 开启后将按需加载运行时能力，以减小构建包体积(ice.js 1.14.0 版本以上开始支持)**

#### **7. 设置主题 [fusion.design](https://fusion.design/)** 
    工程工具的方式将主题样式进行区分和切换

#### **8. UED区分**
    对内UED处理：
        主要是获取权限和个人信息，菜单，
        参考 E:\fpx-fb4-womp-web-react\src\models\basic.ts

    对外UED处理：
        单独获取菜单和个人信息
        参考 E:\fpx-fb4-order-web-react\src\models\basic.ts 
```
