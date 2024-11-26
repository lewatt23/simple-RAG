/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/config.ts":
/*!******************************!*\
  !*** ./src/config/config.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = void 0;
const dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ "dotenv"));
// Set the NODE_ENV to 'development' by default
//process!.env!.NODE_ENV = process.env.NODE_ENV || "development";
const envFound = dotenv_1.default.config();
if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
exports.config = {
    /**
     * Your favorite port
     */
    MEDIA_SERVE_URL: String(process.env.MEDIA_SERVE_URL),
    APP_SERVING_URL: String(process.env.APP_SERVING_URL),
    SERVER_PORT: String(process.env.SERVER_PORT),
    REVERSE_PROXY: false,
    API_BASE_PATH: String(process.env.APP_SERVING_URL),
    DOMAIN: String(process.env.DOMAIN),
    MAIN: String(process.env.MAIN),
    NODE_ENV: String("development"),
    OPENAI_API_KEY: String(process.env.OPENAI_API_KEY),
    PINECONE_API_KEY: String(process.env.PINECONE_API_KEY),
    PINECODE_INDEX: String(process.env.PINECONE_INDEX),
};
exports["default"] = exports.config;


/***/ }),

/***/ "./src/config/express.ts":
/*!*******************************!*\
  !*** ./src/config/express.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupServer = void 0;
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));
const swagger_ui_express_1 = __importDefault(__webpack_require__(/*! swagger-ui-express */ "swagger-ui-express"));
const media_1 = __webpack_require__(/*! ../modules/media */ "./src/modules/media/index.ts");
const routes_1 = __webpack_require__(/*! ../routes/routes */ "./src/routes/routes.ts");
const swagger_json_1 = __importDefault(__webpack_require__(/*! ../routes/swagger.json */ "./src/routes/swagger.json"));
const config_1 = __webpack_require__(/*! ./config */ "./src/config/config.ts");
const setupServer = async () => {
    const app = (0, express_1.default)();
    // Add helmet securities
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    // enable CORS - Cross Origin Resource Sharing
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.text());
    app.use(express_1.default.urlencoded({ extended: true }));
    // mount media endpoints
    (0, media_1.setUpMediaEndpoints)(app);
    // register all our routes on basePath
    const routesApp = (0, express_1.default)();
    (0, routes_1.RegisterRoutes)(app);
    app.use(config_1.config.API_BASE_PATH, routesApp);
    // setup graphql
    app.use(`/docs`, (req, res, next) => {
        if (swagger_json_1.default.servers.length === 1) {
            swagger_json_1.default.servers = [
                { url: `http://${req.get('host')}` },
                { url: `https://${req.get('host')}` },
            ];
            if (config_1.config.REVERSE_PROXY) {
                // Avoid issues like failed to fetch errors when using http, due to Content-Security headers
                swagger_json_1.default.servers = swagger_json_1.default.servers.reverse();
            }
        }
        req.swaggerDoc = swagger_json_1.default;
        next();
    }, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup());
    // error handler
    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }
        const locals = {
            name: err.name,
            message: err.message,
            details: err.details,
        };
        if ('fields' in err) {
            const details = {};
            for (const key in err.fields) {
                // lets remove the body. when validating body
                if (key.startsWith('body.')) {
                    details[key.substr(5)] = err.fields[key];
                }
                else {
                    details[key] = err.fields[key];
                }
            }
            locals.details = details;
        }
        res.status(err.status || 500);
        res.json(locals);
    });
    return app;
};
exports.setupServer = setupServer;


/***/ }),

/***/ "./src/config/index.ts":
/*!*****************************!*\
  !*** ./src/config/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = void 0;
const config_1 = __webpack_require__(/*! ./config */ "./src/config/config.ts");
Object.defineProperty(exports, "config", ({ enumerable: true, get: function () { return config_1.config; } }));
__exportStar(__webpack_require__(/*! ./express */ "./src/config/express.ts"), exports);


/***/ }),

/***/ "./src/modules/chat/chat.controller.ts":
/*!*********************************************!*\
  !*** ./src/modules/chat/chat.controller.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChatController = void 0;
const tsoa_1 = __webpack_require__(/*! tsoa */ "tsoa");
const chat_model_1 = __webpack_require__(/*! ./chat.model */ "./src/modules/chat/chat.model.ts");
/**
 * Chat
 */
let ChatController = class ChatController extends tsoa_1.Controller {
    async uploadDocument(file, title, description) {
        const docs = await chat_model_1.ChatModel.uploadAndIndexDocument(file, title, description);
        // console.log('File uploaded successfully.', file, title, description);
        return docs;
    }
    async getDocuments() {
        const docs = await chat_model_1.ChatModel.getDocuments();
        return docs;
    }
    async askQuestion(body) {
        const results = await chat_model_1.ChatModel.recommendBooks(body.questions);
        console.log('results', results?.content);
        return { answer: String(results?.content) };
    }
    async askQuestionAboutBook(body) {
        const results = await chat_model_1.ChatModel.askQuestion(body.question, body.title);
        console.log('Question received:', results.answer);
        return { answer: results.answer, documentChunks: results.context };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, tsoa_1.Post)('upload'),
    __param(0, (0, tsoa_1.UploadedFile)()),
    __param(1, (0, tsoa_1.FormField)()),
    __param(2, (0, tsoa_1.FormField)())
], ChatController.prototype, "uploadDocument", null);
__decorate([
    (0, tsoa_1.Get)('getDocuments')
], ChatController.prototype, "getDocuments", null);
__decorate([
    (0, tsoa_1.Post)('recommendBooks'),
    __param(0, (0, tsoa_1.Body)())
], ChatController.prototype, "askQuestion", null);
__decorate([
    (0, tsoa_1.Post)('askQuestionAboutBook'),
    __param(0, (0, tsoa_1.Body)())
], ChatController.prototype, "askQuestionAboutBook", null);
exports.ChatController = ChatController = __decorate([
    (0, tsoa_1.Tags)('Chat'),
    (0, tsoa_1.Route)('chat')
], ChatController);


/***/ }),

/***/ "./src/modules/chat/chat.model.ts":
/*!****************************************!*\
  !*** ./src/modules/chat/chat.model.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChatModel = void 0;
const utils_1 = __webpack_require__(/*! ../media/utils */ "./src/modules/media/utils.ts");
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
__webpack_require__(/*! pdf-parse */ "pdf-parse"); // Peer dep
const pdf_1 = __webpack_require__(/*! @langchain/community/document_loaders/fs/pdf */ "@langchain/community/document_loaders/fs/pdf");
const textsplitters_1 = __webpack_require__(/*! @langchain/textsplitters */ "@langchain/textsplitters");
const retrieval_1 = __webpack_require__(/*! langchain/chains/retrieval */ "langchain/chains/retrieval");
const combine_documents_1 = __webpack_require__(/*! langchain/chains/combine_documents */ "langchain/chains/combine_documents");
const prompts_1 = __webpack_require__(/*! @langchain/core/prompts */ "@langchain/core/prompts");
const pinecone_1 = __webpack_require__(/*! @langchain/pinecone */ "@langchain/pinecone");
const openai_1 = __webpack_require__(/*! @langchain/openai */ "@langchain/openai");
const openai_2 = __webpack_require__(/*! @langchain/openai */ "@langchain/openai");
const pinecone_2 = __webpack_require__(/*! @pinecone-database/pinecone */ "@pinecone-database/pinecone");
const config_1 = __webpack_require__(/*! ../../config */ "./src/config/index.ts");
const fileNamePath = path_1.default.resolve(__dirname, '../../../uploaded_files.txt');
const appendFileName = async (fileName, title, description) => {
    try {
        const entry = `${fileName}|${title}|${description}
    
`;
        console.log('entry', entry);
        await fs_1.default.promises.appendFile(fileNamePath, entry, { flag: 'a' }).catch((err) => {
            console.error('Error appending file name:', err);
        });
    }
    catch (err) {
        console.error('Error appending file name:', err);
    }
};
const readFileNames = async () => {
    try {
        const data = await fs_1.default.promises.readFile(fileNamePath, 'utf8');
        // Split the data into lines and filter out any empty or whitespace-only lines
        const entries = data.split('\n').filter((line) => line.trim());
        // Map each entry to an object, only if it has the correct number of parts
        return entries
            .map((entry) => {
            const [fileName, title, description] = entry.split('|').map((part) => part?.trim());
            // Return only if all parts are defined
            if (fileName && title && description) {
                return {
                    fileName,
                    title,
                    description,
                };
            }
        })
            .filter(Boolean); // Filter out any undefined values from the map
    }
    catch (err) {
        console.error('Error reading file names:', err);
        return [];
    }
};
const embeddings = new openai_1.OpenAIEmbeddings({
    model: 'text-embedding-3-small',
});
const pinecone = new pinecone_2.Pinecone();
const pineconeIndex = pinecone.Index(config_1.config.PINECODE_INDEX);
exports.ChatModel = {
    uploadAndIndexDocument: async (file, name, content) => {
        // console.log('file', file);
        const filePath = await (0, utils_1.saveFile)(file.originalname, file);
        await appendFileName(file.originalname, name, content);
        const loader = new pdf_1.PDFLoader(filePath);
        const docs = await loader.load();
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splits = await textSplitter.splitDocuments(docs);
        // pincode setup
        const vectorStore = await pinecone_1.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            maxConcurrency: 5,
        });
        await vectorStore.addDocuments(splits.map((split, index) => ({
            pageContent: split.pageContent, // The text of the split
            metadata: {
                title: name,
            },
        })));
        const doc = readFileNames();
        return doc;
    },
    askQuestion: async (question, title) => {
        const model = new openai_2.ChatOpenAI({ model: 'gpt-4o' });
        const systemTemplate = [
            `You are an assistant for answering questions specifically related to the content of a book.
      Use the provided retrieved context from the vector database to answer questions. If the user asks about a specific page, provide information from that page if it exists in the context. If the user asks what the book is about, provide a concise summary based on the book's title and the retrieved context. 
    
      Your response should adapt to the user's question: be brief if the question is straightforward, or expand only when necessary. 
      If you cannot find relevant information in the context, say that you don't know. Do not invent answers or provide information not found in the retrieved context.
    
      {context}`,
        ].join('');
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ['system', systemTemplate],
            ['human', '{input}'],
        ]);
        const vectorStore = await pinecone_1.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            maxConcurrency: 5,
        });
        // console.log('vectorStore', vectorStore);
        const questionAnswerChain = await (0, combine_documents_1.createStuffDocumentsChain)({ llm: model, prompt });
        const ragChain = await (0, retrieval_1.createRetrievalChain)({
            retriever: vectorStore.asRetriever({
                filter: { title },
            }),
            combineDocsChain: questionAnswerChain,
        });
        console.log('ragChain', ragChain);
        const results = await ragChain.invoke({
            input: question,
        });
        console.log('results', results);
        return results;
    },
    recommendBooks: async (questions) => {
        const model = new openai_2.ChatOpenAI({ model: 'gpt-4o' });
        // Create a recommendation prompt
        const prompt = [
            'system : You are a book recommendation assistant. Based on user preferences, suggest 3 books with a brief description of why each book might appeal to the user. not more that 3 sentence.',
            `human :Here are the user's preferences:\n${questions}`,
        ];
        const results = await model.invoke(prompt);
        return results;
    },
    getDocuments: async () => {
        const docs = readFileNames();
        return docs;
    },
};


/***/ }),

/***/ "./src/modules/media/index.ts":
/*!************************************!*\
  !*** ./src/modules/media/index.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setUpMediaEndpoints = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./src/modules/media/utils.ts");
Object.defineProperty(exports, "setUpMediaEndpoints", ({ enumerable: true, get: function () { return utils_1.setUpMediaEndpoints; } }));
__exportStar(__webpack_require__(/*! ./media.types */ "./src/modules/media/media.types.ts"), exports);


/***/ }),

/***/ "./src/modules/media/media.types.ts":
/*!******************************************!*\
  !*** ./src/modules/media/media.types.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EMediaTypes = void 0;
var EMediaTypes;
(function (EMediaTypes) {
    EMediaTypes["Doc"] = "document";
})(EMediaTypes || (exports.EMediaTypes = EMediaTypes = {}));


/***/ }),

/***/ "./src/modules/media/utils.ts":
/*!************************************!*\
  !*** ./src/modules/media/utils.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getLocalMediaUrl = exports.setUpMediaEndpoints = exports.saveFile = exports.filePath = void 0;
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const config_1 = __webpack_require__(/*! ../../config */ "./src/config/index.ts");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const media_types_1 = __webpack_require__(/*! ./media.types */ "./src/modules/media/media.types.ts");
const util_1 = __webpack_require__(/*! util */ "util");
const fs_1 = __importStar(__webpack_require__(/*! fs */ "fs"));
const mkDirPromised = (0, util_1.promisify)(fs_1.mkdir);
const fsStatPromised = (0, util_1.promisify)(fs_1.stat);
const writeFiler = (0, util_1.promisify)(fs_1.default.writeFile);
const router = express_1.default.Router();
const staticOptions = { maxAge: 31536000000, immutable: true };
const MEDIA_PATH = path_1.default.join(process.cwd(), 'media');
const filePath = (filename) => path_1.default.join(media_types_1.EMediaTypes.Doc, `${Date.now()}${filename}`);
exports.filePath = filePath;
const saveFile = async (filename, file) => {
    // ensure directories
    await mkDirPromised(path_1.default.join(MEDIA_PATH, media_types_1.EMediaTypes.Doc), { recursive: true });
    // hold promises for parallel processing
    const promises = [];
    const rootFilePath = path_1.default.join(MEDIA_PATH, (0, exports.filePath)(filename));
    // Save the file to disk
    promises.push(writeFiler(rootFilePath, file.buffer));
    // Retrieve file size for confirmation/response
    // const fileSize = (await stat(rootFilePath)).size;
    await Promise.all(promises);
    return rootFilePath;
};
exports.saveFile = saveFile;
router.use('/' + media_types_1.EMediaTypes.Doc, express_1.default.static(path_1.default.join(MEDIA_PATH, media_types_1.EMediaTypes.Doc), staticOptions));
/*// Set header to force download
 */
const setUpMediaEndpoints = (app) => {
    // mount static server for media
    app.use('/media', router);
};
exports.setUpMediaEndpoints = setUpMediaEndpoints;
const getLocalMediaUrl = (media) => {
    return `${config_1.config.MAIN}/${(0, exports.filePath)(media)}`;
};
exports.getLocalMediaUrl = getLocalMediaUrl;


/***/ }),

/***/ "./src/routes/routes.ts":
/*!******************************!*\
  !*** ./src/routes/routes.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterRoutes = RegisterRoutes;
/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const runtime_1 = __webpack_require__(/*! @tsoa/runtime */ "@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const chat_controller_1 = __webpack_require__(/*! ./../modules/chat/chat.controller */ "./src/modules/chat/chat.controller.ts");
const multer = __webpack_require__(/*! multer */ "multer");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app, opts) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const upload = opts?.multer || multer({ "limits": { "fileSize": 314572800 } });
    app.post('/chat/upload', upload.fields([{ "name": "file", "maxCount": 1, "multiple": false }]), ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController)), ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController.prototype.uploadDocument)), async function ChatController_uploadDocument(request, response, next) {
        const args = {
            file: { "in": "formData", "name": "file", "required": true, "dataType": "file" },
            title: { "in": "formData", "name": "title", "required": true, "dataType": "string" },
            description: { "in": "formData", "name": "description", "required": true, "dataType": "string" },
        };
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new chat_controller_1.ChatController();
            await templateService.apiHandler({
                methodName: 'uploadDocument',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    app.get('/chat/getDocuments', ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController)), ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController.prototype.getDocuments)), async function ChatController_getDocuments(request, response, next) {
        const args = {};
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new chat_controller_1.ChatController();
            await templateService.apiHandler({
                methodName: 'getDocuments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    app.post('/chat/recommendBooks', ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController)), ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController.prototype.askQuestion)), async function ChatController_askQuestion(request, response, next) {
        const args = {
            body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "questions": { "dataType": "string", "required": true } } },
        };
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new chat_controller_1.ChatController();
            await templateService.apiHandler({
                methodName: 'askQuestion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    app.post('/chat/askQuestionAboutBook', ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController)), ...((0, runtime_1.fetchMiddlewares)(chat_controller_1.ChatController.prototype.askQuestionAboutBook)), async function ChatController_askQuestionAboutBook(request, response, next) {
        const args = {
            body: { "in": "body", "name": "body", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "title": { "dataType": "string", "required": true }, "question": { "dataType": "string", "required": true } } },
        };
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args, request, response });
            const controller = new chat_controller_1.ChatController();
            await templateService.apiHandler({
                methodName: 'askQuestionAboutBook',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


/***/ }),

/***/ "@langchain/community/document_loaders/fs/pdf":
/*!***************************************************************!*\
  !*** external "@langchain/community/document_loaders/fs/pdf" ***!
  \***************************************************************/
/***/ ((module) => {

module.exports = require("@langchain/community/document_loaders/fs/pdf");

/***/ }),

/***/ "@langchain/core/prompts":
/*!******************************************!*\
  !*** external "@langchain/core/prompts" ***!
  \******************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/prompts");

/***/ }),

/***/ "@langchain/openai":
/*!************************************!*\
  !*** external "@langchain/openai" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("@langchain/openai");

/***/ }),

/***/ "@langchain/pinecone":
/*!**************************************!*\
  !*** external "@langchain/pinecone" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require("@langchain/pinecone");

/***/ }),

/***/ "@langchain/textsplitters":
/*!*******************************************!*\
  !*** external "@langchain/textsplitters" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@langchain/textsplitters");

/***/ }),

/***/ "@pinecone-database/pinecone":
/*!**********************************************!*\
  !*** external "@pinecone-database/pinecone" ***!
  \**********************************************/
/***/ ((module) => {

module.exports = require("@pinecone-database/pinecone");

/***/ }),

/***/ "@tsoa/runtime":
/*!********************************!*\
  !*** external "@tsoa/runtime" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@tsoa/runtime");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ "langchain/chains/combine_documents":
/*!*****************************************************!*\
  !*** external "langchain/chains/combine_documents" ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = require("langchain/chains/combine_documents");

/***/ }),

/***/ "langchain/chains/retrieval":
/*!*********************************************!*\
  !*** external "langchain/chains/retrieval" ***!
  \*********************************************/
/***/ ((module) => {

module.exports = require("langchain/chains/retrieval");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("multer");

/***/ }),

/***/ "pdf-parse":
/*!****************************!*\
  !*** external "pdf-parse" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("pdf-parse");

/***/ }),

/***/ "swagger-ui-express":
/*!*************************************!*\
  !*** external "swagger-ui-express" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("swagger-ui-express");

/***/ }),

/***/ "tsoa":
/*!***********************!*\
  !*** external "tsoa" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("tsoa");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "./src/routes/swagger.json":
/*!*********************************!*\
  !*** ./src/routes/swagger.json ***!
  \*********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"openapi":"3.0.0","components":{"examples":{},"headers":{},"parameters":{},"requestBodies":{},"responses":{},"schemas":{},"securitySchemes":{}},"info":{"title":"ai-enhanced-backend","version":"1.0.0","license":{"name":"MIT"},"contact":{}},"paths":{"/chat/upload":{"post":{"operationId":"UploadDocument","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{}}}}},"tags":["Chat"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"multipart/form-data":{"schema":{"type":"object","properties":{"file":{"type":"string","format":"binary"},"title":{"type":"string"},"description":{"type":"string"}},"required":["file","title","description"]}}}}}},"/chat/getDocuments":{"get":{"operationId":"GetDocuments","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{}}}}},"tags":["Chat"],"security":[],"parameters":[]}},"/chat/recommendBooks":{"post":{"operationId":"AskQuestion","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"answer":{"type":"string"}},"required":["answer"],"type":"object"}}}}},"tags":["Chat"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"properties":{"questions":{"type":"string"}},"required":["questions"],"type":"object"}}}}}},"/chat/askQuestionAboutBook":{"post":{"operationId":"AskQuestionAboutBook","responses":{"200":{"description":"Ok","content":{"application/json":{"schema":{"properties":{"documentChunks":{"items":{},"type":"array"},"answer":{"type":"string"}},"required":["documentChunks","answer"],"type":"object"}}}}},"tags":["Chat"],"security":[],"parameters":[],"requestBody":{"required":true,"content":{"application/json":{"schema":{"properties":{"title":{"type":"string"},"question":{"type":"string"}},"required":["title","question"],"type":"object"}}}}}}},"servers":[{"url":"/"}]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(/*! ./config */ "./src/config/index.ts");
(0, config_1.setupServer)().then((app) => {
    app.listen(config_1.config.SERVER_PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`🚀 Server started on port ${config_1.config.SERVER_PORT} (${config_1.config.NODE_ENV})`);
    });
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QmE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsaUJBQWlCLG1CQUFPLENBQUMsdUNBQVU7QUFDbkM7QUFDQTtBQUNBO0FBQ0EsaURBQWlELDZCQUE2QixHQUFHLHlCQUF5QjtBQUMxRyxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvLi9zcmMvY29uZmlnL2NvbmZpZy50cyIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kLy4vc3JjL2NvbmZpZy9leHByZXNzLnRzIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvLi9zcmMvY29uZmlnL2luZGV4LnRzIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvLi9zcmMvbW9kdWxlcy9jaGF0L2NoYXQuY29udHJvbGxlci50cyIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kLy4vc3JjL21vZHVsZXMvY2hhdC9jaGF0Lm1vZGVsLnRzIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvLi9zcmMvbW9kdWxlcy9tZWRpYS9pbmRleC50cyIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kLy4vc3JjL21vZHVsZXMvbWVkaWEvbWVkaWEudHlwZXMudHMiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC8uL3NyYy9tb2R1bGVzL21lZGlhL3V0aWxzLnRzIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvLi9zcmMvcm91dGVzL3JvdXRlcy50cyIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQGxhbmdjaGFpbi9jb21tdW5pdHkvZG9jdW1lbnRfbG9hZGVycy9mcy9wZGZcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQGxhbmdjaGFpbi9jb3JlL3Byb21wdHNcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQGxhbmdjaGFpbi9vcGVuYWlcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQGxhbmdjaGFpbi9waW5lY29uZVwiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJAbGFuZ2NoYWluL3RleHRzcGxpdHRlcnNcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiQHBpbmVjb25lLWRhdGFiYXNlL3BpbmVjb25lXCIiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcIkB0c29hL3J1bnRpbWVcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiY29yc1wiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJkb3RlbnZcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJoZWxtZXRcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwibGFuZ2NoYWluL2NoYWlucy9jb21iaW5lX2RvY3VtZW50c1wiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJsYW5nY2hhaW4vY2hhaW5zL3JldHJpZXZhbFwiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJtdWx0ZXJcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIGNvbW1vbmpzIFwicGRmLXBhcnNlXCIiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC9leHRlcm5hbCBjb21tb25qcyBcInN3YWdnZXItdWktZXhwcmVzc1wiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvZXh0ZXJuYWwgY29tbW9uanMgXCJ0c29hXCIiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwiZnNcIiIsIndlYnBhY2s6Ly9haS1lbmhhbmNlZC1iYWNrZW5kL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwidXRpbFwiIiwid2VicGFjazovL2FpLWVuaGFuY2VkLWJhY2tlbmQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYWktZW5oYW5jZWQtYmFja2VuZC8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY29uZmlnID0gdm9pZCAwO1xuY29uc3QgZG90ZW52XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImRvdGVudlwiKSk7XG4vLyBTZXQgdGhlIE5PREVfRU5WIHRvICdkZXZlbG9wbWVudCcgYnkgZGVmYXVsdFxuLy9wcm9jZXNzIS5lbnYhLk5PREVfRU5WID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgXCJkZXZlbG9wbWVudFwiO1xuY29uc3QgZW52Rm91bmQgPSBkb3RlbnZfMS5kZWZhdWx0LmNvbmZpZygpO1xuaWYgKGVudkZvdW5kLmVycm9yKSB7XG4gICAgLy8gVGhpcyBlcnJvciBzaG91bGQgY3Jhc2ggd2hvbGUgcHJvY2Vzc1xuICAgIHRocm93IG5ldyBFcnJvcihcIuKaoO+4jyAgQ291bGRuJ3QgZmluZCAuZW52IGZpbGUgIOKaoO+4j1wiKTtcbn1cbmV4cG9ydHMuY29uZmlnID0ge1xuICAgIC8qKlxuICAgICAqIFlvdXIgZmF2b3JpdGUgcG9ydFxuICAgICAqL1xuICAgIE1FRElBX1NFUlZFX1VSTDogU3RyaW5nKHByb2Nlc3MuZW52Lk1FRElBX1NFUlZFX1VSTCksXG4gICAgQVBQX1NFUlZJTkdfVVJMOiBTdHJpbmcocHJvY2Vzcy5lbnYuQVBQX1NFUlZJTkdfVVJMKSxcbiAgICBTRVJWRVJfUE9SVDogU3RyaW5nKHByb2Nlc3MuZW52LlNFUlZFUl9QT1JUKSxcbiAgICBSRVZFUlNFX1BST1hZOiBmYWxzZSxcbiAgICBBUElfQkFTRV9QQVRIOiBTdHJpbmcocHJvY2Vzcy5lbnYuQVBQX1NFUlZJTkdfVVJMKSxcbiAgICBET01BSU46IFN0cmluZyhwcm9jZXNzLmVudi5ET01BSU4pLFxuICAgIE1BSU46IFN0cmluZyhwcm9jZXNzLmVudi5NQUlOKSxcbiAgICBOT0RFX0VOVjogU3RyaW5nKHByb2Nlc3MuZW52Lk5PREVfRU5WKSxcbiAgICBPUEVOQUlfQVBJX0tFWTogU3RyaW5nKHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZKSxcbiAgICBQSU5FQ09ORV9BUElfS0VZOiBTdHJpbmcocHJvY2Vzcy5lbnYuUElORUNPTkVfQVBJX0tFWSksXG4gICAgUElORUNPREVfSU5ERVg6IFN0cmluZyhwcm9jZXNzLmVudi5QSU5FQ09ORV9JTkRFWCksXG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jb25maWc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0dXBTZXJ2ZXIgPSB2b2lkIDA7XG5jb25zdCBjb3JzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNvcnNcIikpO1xuY29uc3QgZXhwcmVzc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJleHByZXNzXCIpKTtcbmNvbnN0IGhlbG1ldF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJoZWxtZXRcIikpO1xuY29uc3Qgc3dhZ2dlcl91aV9leHByZXNzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInN3YWdnZXItdWktZXhwcmVzc1wiKSk7XG5jb25zdCBtZWRpYV8xID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWVkaWFcIik7XG5jb25zdCByb3V0ZXNfMSA9IHJlcXVpcmUoXCIuLi9yb3V0ZXMvcm91dGVzXCIpO1xuY29uc3Qgc3dhZ2dlcl9qc29uXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4uL3JvdXRlcy9zd2FnZ2VyLmpzb25cIikpO1xuY29uc3QgY29uZmlnXzEgPSByZXF1aXJlKFwiLi9jb25maWdcIik7XG5jb25zdCBzZXR1cFNlcnZlciA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSAoMCwgZXhwcmVzc18xLmRlZmF1bHQpKCk7XG4gICAgLy8gQWRkIGhlbG1ldCBzZWN1cml0aWVzXG4gICAgYXBwLnVzZSgoMCwgaGVsbWV0XzEuZGVmYXVsdCkoeyBjb250ZW50U2VjdXJpdHlQb2xpY3k6IGZhbHNlIH0pKTtcbiAgICAvLyBlbmFibGUgQ09SUyAtIENyb3NzIE9yaWdpbiBSZXNvdXJjZSBTaGFyaW5nXG4gICAgYXBwLnVzZSgoMCwgY29yc18xLmRlZmF1bHQpKCkpO1xuICAgIGFwcC51c2UoZXhwcmVzc18xLmRlZmF1bHQuanNvbigpKTtcbiAgICBhcHAudXNlKGV4cHJlc3NfMS5kZWZhdWx0LnRleHQoKSk7XG4gICAgYXBwLnVzZShleHByZXNzXzEuZGVmYXVsdC51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xuICAgIC8vIG1vdW50IG1lZGlhIGVuZHBvaW50c1xuICAgICgwLCBtZWRpYV8xLnNldFVwTWVkaWFFbmRwb2ludHMpKGFwcCk7XG4gICAgLy8gcmVnaXN0ZXIgYWxsIG91ciByb3V0ZXMgb24gYmFzZVBhdGhcbiAgICBjb25zdCByb3V0ZXNBcHAgPSAoMCwgZXhwcmVzc18xLmRlZmF1bHQpKCk7XG4gICAgKDAsIHJvdXRlc18xLlJlZ2lzdGVyUm91dGVzKShhcHApO1xuICAgIGFwcC51c2UoY29uZmlnXzEuY29uZmlnLkFQSV9CQVNFX1BBVEgsIHJvdXRlc0FwcCk7XG4gICAgLy8gc2V0dXAgZ3JhcGhxbFxuICAgIGFwcC51c2UoYC9kb2NzYCwgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIGlmIChzd2FnZ2VyX2pzb25fMS5kZWZhdWx0LnNlcnZlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBzd2FnZ2VyX2pzb25fMS5kZWZhdWx0LnNlcnZlcnMgPSBbXG4gICAgICAgICAgICAgICAgeyB1cmw6IGBodHRwOi8vJHtyZXEuZ2V0KCdob3N0Jyl9YCB9LFxuICAgICAgICAgICAgICAgIHsgdXJsOiBgaHR0cHM6Ly8ke3JlcS5nZXQoJ2hvc3QnKX1gIH0sXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ18xLmNvbmZpZy5SRVZFUlNFX1BST1hZKSB7XG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgaXNzdWVzIGxpa2UgZmFpbGVkIHRvIGZldGNoIGVycm9ycyB3aGVuIHVzaW5nIGh0dHAsIGR1ZSB0byBDb250ZW50LVNlY3VyaXR5IGhlYWRlcnNcbiAgICAgICAgICAgICAgICBzd2FnZ2VyX2pzb25fMS5kZWZhdWx0LnNlcnZlcnMgPSBzd2FnZ2VyX2pzb25fMS5kZWZhdWx0LnNlcnZlcnMucmV2ZXJzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlcS5zd2FnZ2VyRG9jID0gc3dhZ2dlcl9qc29uXzEuZGVmYXVsdDtcbiAgICAgICAgbmV4dCgpO1xuICAgIH0sIHN3YWdnZXJfdWlfZXhwcmVzc18xLmRlZmF1bHQuc2VydmUsIHN3YWdnZXJfdWlfZXhwcmVzc18xLmRlZmF1bHQuc2V0dXAoKSk7XG4gICAgLy8gZXJyb3IgaGFuZGxlclxuICAgIGFwcC51c2UoKGVyciwgcmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgaWYgKHJlcy5oZWFkZXJzU2VudCkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhbHMgPSB7XG4gICAgICAgICAgICBuYW1lOiBlcnIubmFtZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgZGV0YWlsczogZXJyLmRldGFpbHMsXG4gICAgICAgIH07XG4gICAgICAgIGlmICgnZmllbGRzJyBpbiBlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldGFpbHMgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGVyci5maWVsZHMpIHtcbiAgICAgICAgICAgICAgICAvLyBsZXRzIHJlbW92ZSB0aGUgYm9keS4gd2hlbiB2YWxpZGF0aW5nIGJvZHlcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2JvZHkuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1trZXkuc3Vic3RyKDUpXSA9IGVyci5maWVsZHNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNba2V5XSA9IGVyci5maWVsZHNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2NhbHMuZGV0YWlscyA9IGRldGFpbHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cyhlcnIuc3RhdHVzIHx8IDUwMCk7XG4gICAgICAgIHJlcy5qc29uKGxvY2Fscyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFwcDtcbn07XG5leHBvcnRzLnNldHVwU2VydmVyID0gc2V0dXBTZXJ2ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jb25maWcgPSB2b2lkIDA7XG5jb25zdCBjb25maWdfMSA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNvbmZpZ1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY29uZmlnXzEuY29uZmlnOyB9IH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2V4cHJlc3NcIiksIGV4cG9ydHMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19wYXJhbSA9ICh0aGlzICYmIHRoaXMuX19wYXJhbSkgfHwgZnVuY3Rpb24gKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2hhdENvbnRyb2xsZXIgPSB2b2lkIDA7XG5jb25zdCB0c29hXzEgPSByZXF1aXJlKFwidHNvYVwiKTtcbmNvbnN0IGNoYXRfbW9kZWxfMSA9IHJlcXVpcmUoXCIuL2NoYXQubW9kZWxcIik7XG4vKipcbiAqIENoYXRcbiAqL1xubGV0IENoYXRDb250cm9sbGVyID0gY2xhc3MgQ2hhdENvbnRyb2xsZXIgZXh0ZW5kcyB0c29hXzEuQ29udHJvbGxlciB7XG4gICAgYXN5bmMgdXBsb2FkRG9jdW1lbnQoZmlsZSwgdGl0bGUsIGRlc2NyaXB0aW9uKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBjaGF0X21vZGVsXzEuQ2hhdE1vZGVsLnVwbG9hZEFuZEluZGV4RG9jdW1lbnQoZmlsZSwgdGl0bGUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ0ZpbGUgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5LicsIGZpbGUsIHRpdGxlLCBkZXNjcmlwdGlvbik7XG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIH1cbiAgICBhc3luYyBnZXREb2N1bWVudHMoKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBjaGF0X21vZGVsXzEuQ2hhdE1vZGVsLmdldERvY3VtZW50cygpO1xuICAgICAgICByZXR1cm4gZG9jcztcbiAgICB9XG4gICAgYXN5bmMgYXNrUXVlc3Rpb24oYm9keSkge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgY2hhdF9tb2RlbF8xLkNoYXRNb2RlbC5yZWNvbW1lbmRCb29rcyhib2R5LnF1ZXN0aW9ucyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHRzJywgcmVzdWx0cz8uY29udGVudCk7XG4gICAgICAgIHJldHVybiB7IGFuc3dlcjogU3RyaW5nKHJlc3VsdHM/LmNvbnRlbnQpIH07XG4gICAgfVxuICAgIGFzeW5jIGFza1F1ZXN0aW9uQWJvdXRCb29rKGJvZHkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGNoYXRfbW9kZWxfMS5DaGF0TW9kZWwuYXNrUXVlc3Rpb24oYm9keS5xdWVzdGlvbiwgYm9keS50aXRsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdRdWVzdGlvbiByZWNlaXZlZDonLCByZXN1bHRzLmFuc3dlcik7XG4gICAgICAgIHJldHVybiB7IGFuc3dlcjogcmVzdWx0cy5hbnN3ZXIsIGRvY3VtZW50Q2h1bmtzOiByZXN1bHRzLmNvbnRleHQgfTtcbiAgICB9XG59O1xuZXhwb3J0cy5DaGF0Q29udHJvbGxlciA9IENoYXRDb250cm9sbGVyO1xuX19kZWNvcmF0ZShbXG4gICAgKDAsIHRzb2FfMS5Qb3N0KSgndXBsb2FkJyksXG4gICAgX19wYXJhbSgwLCAoMCwgdHNvYV8xLlVwbG9hZGVkRmlsZSkoKSksXG4gICAgX19wYXJhbSgxLCAoMCwgdHNvYV8xLkZvcm1GaWVsZCkoKSksXG4gICAgX19wYXJhbSgyLCAoMCwgdHNvYV8xLkZvcm1GaWVsZCkoKSlcbl0sIENoYXRDb250cm9sbGVyLnByb3RvdHlwZSwgXCJ1cGxvYWREb2N1bWVudFwiLCBudWxsKTtcbl9fZGVjb3JhdGUoW1xuICAgICgwLCB0c29hXzEuR2V0KSgnZ2V0RG9jdW1lbnRzJylcbl0sIENoYXRDb250cm9sbGVyLnByb3RvdHlwZSwgXCJnZXREb2N1bWVudHNcIiwgbnVsbCk7XG5fX2RlY29yYXRlKFtcbiAgICAoMCwgdHNvYV8xLlBvc3QpKCdyZWNvbW1lbmRCb29rcycpLFxuICAgIF9fcGFyYW0oMCwgKDAsIHRzb2FfMS5Cb2R5KSgpKVxuXSwgQ2hhdENvbnRyb2xsZXIucHJvdG90eXBlLCBcImFza1F1ZXN0aW9uXCIsIG51bGwpO1xuX19kZWNvcmF0ZShbXG4gICAgKDAsIHRzb2FfMS5Qb3N0KSgnYXNrUXVlc3Rpb25BYm91dEJvb2snKSxcbiAgICBfX3BhcmFtKDAsICgwLCB0c29hXzEuQm9keSkoKSlcbl0sIENoYXRDb250cm9sbGVyLnByb3RvdHlwZSwgXCJhc2tRdWVzdGlvbkFib3V0Qm9va1wiLCBudWxsKTtcbmV4cG9ydHMuQ2hhdENvbnRyb2xsZXIgPSBDaGF0Q29udHJvbGxlciA9IF9fZGVjb3JhdGUoW1xuICAgICgwLCB0c29hXzEuVGFncykoJ0NoYXQnKSxcbiAgICAoMCwgdHNvYV8xLlJvdXRlKSgnY2hhdCcpXG5dLCBDaGF0Q29udHJvbGxlcik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2hhdE1vZGVsID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuLi9tZWRpYS91dGlsc1wiKTtcbmNvbnN0IGZzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImZzXCIpKTtcbmNvbnN0IHBhdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwicGF0aFwiKSk7XG5yZXF1aXJlKFwicGRmLXBhcnNlXCIpOyAvLyBQZWVyIGRlcFxuY29uc3QgcGRmXzEgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9jb21tdW5pdHkvZG9jdW1lbnRfbG9hZGVycy9mcy9wZGZcIik7XG5jb25zdCB0ZXh0c3BsaXR0ZXJzXzEgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi90ZXh0c3BsaXR0ZXJzXCIpO1xuY29uc3QgcmV0cmlldmFsXzEgPSByZXF1aXJlKFwibGFuZ2NoYWluL2NoYWlucy9yZXRyaWV2YWxcIik7XG5jb25zdCBjb21iaW5lX2RvY3VtZW50c18xID0gcmVxdWlyZShcImxhbmdjaGFpbi9jaGFpbnMvY29tYmluZV9kb2N1bWVudHNcIik7XG5jb25zdCBwcm9tcHRzXzEgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9jb3JlL3Byb21wdHNcIik7XG5jb25zdCBwaW5lY29uZV8xID0gcmVxdWlyZShcIkBsYW5nY2hhaW4vcGluZWNvbmVcIik7XG5jb25zdCBvcGVuYWlfMSA9IHJlcXVpcmUoXCJAbGFuZ2NoYWluL29wZW5haVwiKTtcbmNvbnN0IG9wZW5haV8yID0gcmVxdWlyZShcIkBsYW5nY2hhaW4vb3BlbmFpXCIpO1xuY29uc3QgcGluZWNvbmVfMiA9IHJlcXVpcmUoXCJAcGluZWNvbmUtZGF0YWJhc2UvcGluZWNvbmVcIik7XG5jb25zdCBjb25maWdfMSA9IHJlcXVpcmUoXCIuLi8uLi9jb25maWdcIik7XG5jb25zdCBmaWxlTmFtZVBhdGggPSBwYXRoXzEuZGVmYXVsdC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLy4uL3VwbG9hZGVkX2ZpbGVzLnR4dCcpO1xuY29uc3QgYXBwZW5kRmlsZU5hbWUgPSBhc3luYyAoZmlsZU5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYCR7ZmlsZU5hbWV9fCR7dGl0bGV9fCR7ZGVzY3JpcHRpb259XHJcbiAgICBcclxuYDtcbiAgICAgICAgY29uc29sZS5sb2coJ2VudHJ5JywgZW50cnkpO1xuICAgICAgICBhd2FpdCBmc18xLmRlZmF1bHQucHJvbWlzZXMuYXBwZW5kRmlsZShmaWxlTmFtZVBhdGgsIGVudHJ5LCB7IGZsYWc6ICdhJyB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhcHBlbmRpbmcgZmlsZSBuYW1lOicsIGVycik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGFwcGVuZGluZyBmaWxlIG5hbWU6JywgZXJyKTtcbiAgICB9XG59O1xuY29uc3QgcmVhZEZpbGVOYW1lcyA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZnNfMS5kZWZhdWx0LnByb21pc2VzLnJlYWRGaWxlKGZpbGVOYW1lUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgLy8gU3BsaXQgdGhlIGRhdGEgaW50byBsaW5lcyBhbmQgZmlsdGVyIG91dCBhbnkgZW1wdHkgb3Igd2hpdGVzcGFjZS1vbmx5IGxpbmVzXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBkYXRhLnNwbGl0KCdcXG4nKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUudHJpbSgpKTtcbiAgICAgICAgLy8gTWFwIGVhY2ggZW50cnkgdG8gYW4gb2JqZWN0LCBvbmx5IGlmIGl0IGhhcyB0aGUgY29ycmVjdCBudW1iZXIgb2YgcGFydHNcbiAgICAgICAgcmV0dXJuIGVudHJpZXNcbiAgICAgICAgICAgIC5tYXAoKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbZmlsZU5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbl0gPSBlbnRyeS5zcGxpdCgnfCcpLm1hcCgocGFydCkgPT4gcGFydD8udHJpbSgpKTtcbiAgICAgICAgICAgIC8vIFJldHVybiBvbmx5IGlmIGFsbCBwYXJ0cyBhcmUgZGVmaW5lZFxuICAgICAgICAgICAgaWYgKGZpbGVOYW1lICYmIHRpdGxlICYmIGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKTsgLy8gRmlsdGVyIG91dCBhbnkgdW5kZWZpbmVkIHZhbHVlcyBmcm9tIHRoZSBtYXBcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWFkaW5nIGZpbGUgbmFtZXM6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn07XG5jb25zdCBlbWJlZGRpbmdzID0gbmV3IG9wZW5haV8xLk9wZW5BSUVtYmVkZGluZ3Moe1xuICAgIG1vZGVsOiAndGV4dC1lbWJlZGRpbmctMy1zbWFsbCcsXG59KTtcbmNvbnN0IHBpbmVjb25lID0gbmV3IHBpbmVjb25lXzIuUGluZWNvbmUoKTtcbmNvbnN0IHBpbmVjb25lSW5kZXggPSBwaW5lY29uZS5JbmRleChjb25maWdfMS5jb25maWcuUElORUNPREVfSU5ERVgpO1xuZXhwb3J0cy5DaGF0TW9kZWwgPSB7XG4gICAgdXBsb2FkQW5kSW5kZXhEb2N1bWVudDogYXN5bmMgKGZpbGUsIG5hbWUsIGNvbnRlbnQpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBhd2FpdCAoMCwgdXRpbHNfMS5zYXZlRmlsZSkoZmlsZS5vcmlnaW5hbG5hbWUsIGZpbGUpO1xuICAgICAgICBhd2FpdCBhcHBlbmRGaWxlTmFtZShmaWxlLm9yaWdpbmFsbmFtZSwgbmFtZSwgY29udGVudCk7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IG5ldyBwZGZfMS5QREZMb2FkZXIoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBkb2NzID0gYXdhaXQgbG9hZGVyLmxvYWQoKTtcbiAgICAgICAgY29uc3QgdGV4dFNwbGl0dGVyID0gbmV3IHRleHRzcGxpdHRlcnNfMS5SZWN1cnNpdmVDaGFyYWN0ZXJUZXh0U3BsaXR0ZXIoe1xuICAgICAgICAgICAgY2h1bmtTaXplOiAxMDAwLFxuICAgICAgICAgICAgY2h1bmtPdmVybGFwOiAyMDAsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzcGxpdHMgPSBhd2FpdCB0ZXh0U3BsaXR0ZXIuc3BsaXREb2N1bWVudHMoZG9jcyk7XG4gICAgICAgIC8vIHBpbmNvZGUgc2V0dXBcbiAgICAgICAgY29uc3QgdmVjdG9yU3RvcmUgPSBhd2FpdCBwaW5lY29uZV8xLlBpbmVjb25lU3RvcmUuZnJvbUV4aXN0aW5nSW5kZXgoZW1iZWRkaW5ncywge1xuICAgICAgICAgICAgcGluZWNvbmVJbmRleCxcbiAgICAgICAgICAgIG1heENvbmN1cnJlbmN5OiA1LFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdmVjdG9yU3RvcmUuYWRkRG9jdW1lbnRzKHNwbGl0cy5tYXAoKHNwbGl0LCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIHBhZ2VDb250ZW50OiBzcGxpdC5wYWdlQ29udGVudCwgLy8gVGhlIHRleHQgb2YgdGhlIHNwbGl0XG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBuYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpKTtcbiAgICAgICAgY29uc3QgZG9jID0gcmVhZEZpbGVOYW1lcygpO1xuICAgICAgICByZXR1cm4gZG9jO1xuICAgIH0sXG4gICAgYXNrUXVlc3Rpb246IGFzeW5jIChxdWVzdGlvbiwgdGl0bGUpID0+IHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSBuZXcgb3BlbmFpXzIuQ2hhdE9wZW5BSSh7IG1vZGVsOiAnZ3B0LTRvJyB9KTtcbiAgICAgICAgY29uc3Qgc3lzdGVtVGVtcGxhdGUgPSBbXG4gICAgICAgICAgICBgWW91IGFyZSBhbiBhc3Npc3RhbnQgZm9yIGFuc3dlcmluZyBxdWVzdGlvbnMgc3BlY2lmaWNhbGx5IHJlbGF0ZWQgdG8gdGhlIGNvbnRlbnQgb2YgYSBib29rLlxyXG4gICAgICBVc2UgdGhlIHByb3ZpZGVkIHJldHJpZXZlZCBjb250ZXh0IGZyb20gdGhlIHZlY3RvciBkYXRhYmFzZSB0byBhbnN3ZXIgcXVlc3Rpb25zLiBJZiB0aGUgdXNlciBhc2tzIGFib3V0IGEgc3BlY2lmaWMgcGFnZSwgcHJvdmlkZSBpbmZvcm1hdGlvbiBmcm9tIHRoYXQgcGFnZSBpZiBpdCBleGlzdHMgaW4gdGhlIGNvbnRleHQuIElmIHRoZSB1c2VyIGFza3Mgd2hhdCB0aGUgYm9vayBpcyBhYm91dCwgcHJvdmlkZSBhIGNvbmNpc2Ugc3VtbWFyeSBiYXNlZCBvbiB0aGUgYm9vaydzIHRpdGxlIGFuZCB0aGUgcmV0cmlldmVkIGNvbnRleHQuIFxyXG4gICAgXHJcbiAgICAgIFlvdXIgcmVzcG9uc2Ugc2hvdWxkIGFkYXB0IHRvIHRoZSB1c2VyJ3MgcXVlc3Rpb246IGJlIGJyaWVmIGlmIHRoZSBxdWVzdGlvbiBpcyBzdHJhaWdodGZvcndhcmQsIG9yIGV4cGFuZCBvbmx5IHdoZW4gbmVjZXNzYXJ5LiBcclxuICAgICAgSWYgeW91IGNhbm5vdCBmaW5kIHJlbGV2YW50IGluZm9ybWF0aW9uIGluIHRoZSBjb250ZXh0LCBzYXkgdGhhdCB5b3UgZG9uJ3Qga25vdy4gRG8gbm90IGludmVudCBhbnN3ZXJzIG9yIHByb3ZpZGUgaW5mb3JtYXRpb24gbm90IGZvdW5kIGluIHRoZSByZXRyaWV2ZWQgY29udGV4dC5cclxuICAgIFxyXG4gICAgICB7Y29udGV4dH1gLFxuICAgICAgICBdLmpvaW4oJycpO1xuICAgICAgICBjb25zdCBwcm9tcHQgPSBwcm9tcHRzXzEuQ2hhdFByb21wdFRlbXBsYXRlLmZyb21NZXNzYWdlcyhbXG4gICAgICAgICAgICBbJ3N5c3RlbScsIHN5c3RlbVRlbXBsYXRlXSxcbiAgICAgICAgICAgIFsnaHVtYW4nLCAne2lucHV0fSddLFxuICAgICAgICBdKTtcbiAgICAgICAgY29uc3QgdmVjdG9yU3RvcmUgPSBhd2FpdCBwaW5lY29uZV8xLlBpbmVjb25lU3RvcmUuZnJvbUV4aXN0aW5nSW5kZXgoZW1iZWRkaW5ncywge1xuICAgICAgICAgICAgcGluZWNvbmVJbmRleCxcbiAgICAgICAgICAgIG1heENvbmN1cnJlbmN5OiA1LFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3ZlY3RvclN0b3JlJywgdmVjdG9yU3RvcmUpO1xuICAgICAgICBjb25zdCBxdWVzdGlvbkFuc3dlckNoYWluID0gYXdhaXQgKDAsIGNvbWJpbmVfZG9jdW1lbnRzXzEuY3JlYXRlU3R1ZmZEb2N1bWVudHNDaGFpbikoeyBsbG06IG1vZGVsLCBwcm9tcHQgfSk7XG4gICAgICAgIGNvbnN0IHJhZ0NoYWluID0gYXdhaXQgKDAsIHJldHJpZXZhbF8xLmNyZWF0ZVJldHJpZXZhbENoYWluKSh7XG4gICAgICAgICAgICByZXRyaWV2ZXI6IHZlY3RvclN0b3JlLmFzUmV0cmlldmVyKHtcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHsgdGl0bGUgfSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY29tYmluZURvY3NDaGFpbjogcXVlc3Rpb25BbnN3ZXJDaGFpbixcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyYWdDaGFpbicsIHJhZ0NoYWluKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJhZ0NoYWluLmludm9rZSh7XG4gICAgICAgICAgICBpbnB1dDogcXVlc3Rpb24sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0cycsIHJlc3VsdHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIHJlY29tbWVuZEJvb2tzOiBhc3luYyAocXVlc3Rpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gbmV3IG9wZW5haV8yLkNoYXRPcGVuQUkoeyBtb2RlbDogJ2dwdC00bycgfSk7XG4gICAgICAgIC8vIENyZWF0ZSBhIHJlY29tbWVuZGF0aW9uIHByb21wdFxuICAgICAgICBjb25zdCBwcm9tcHQgPSBbXG4gICAgICAgICAgICAnc3lzdGVtIDogWW91IGFyZSBhIGJvb2sgcmVjb21tZW5kYXRpb24gYXNzaXN0YW50LiBCYXNlZCBvbiB1c2VyIHByZWZlcmVuY2VzLCBzdWdnZXN0IDMgYm9va3Mgd2l0aCBhIGJyaWVmIGRlc2NyaXB0aW9uIG9mIHdoeSBlYWNoIGJvb2sgbWlnaHQgYXBwZWFsIHRvIHRoZSB1c2VyLiBub3QgbW9yZSB0aGF0IDMgc2VudGVuY2UuJyxcbiAgICAgICAgICAgIGBodW1hbiA6SGVyZSBhcmUgdGhlIHVzZXIncyBwcmVmZXJlbmNlczpcXG4ke3F1ZXN0aW9uc31gLFxuICAgICAgICBdO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbW9kZWwuaW52b2tlKHByb21wdCk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0sXG4gICAgZ2V0RG9jdW1lbnRzOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSByZWFkRmlsZU5hbWVzKCk7XG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIH0sXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0VXBNZWRpYUVuZHBvaW50cyA9IHZvaWQgMDtcbmNvbnN0IHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInNldFVwTWVkaWFFbmRwb2ludHNcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHV0aWxzXzEuc2V0VXBNZWRpYUVuZHBvaW50czsgfSB9KTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9tZWRpYS50eXBlc1wiKSwgZXhwb3J0cyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRU1lZGlhVHlwZXMgPSB2b2lkIDA7XG52YXIgRU1lZGlhVHlwZXM7XG4oZnVuY3Rpb24gKEVNZWRpYVR5cGVzKSB7XG4gICAgRU1lZGlhVHlwZXNbXCJEb2NcIl0gPSBcImRvY3VtZW50XCI7XG59KShFTWVkaWFUeXBlcyB8fCAoZXhwb3J0cy5FTWVkaWFUeXBlcyA9IEVNZWRpYVR5cGVzID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdldExvY2FsTWVkaWFVcmwgPSBleHBvcnRzLnNldFVwTWVkaWFFbmRwb2ludHMgPSBleHBvcnRzLnNhdmVGaWxlID0gZXhwb3J0cy5maWxlUGF0aCA9IHZvaWQgMDtcbmNvbnN0IGV4cHJlc3NfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZXhwcmVzc1wiKSk7XG5jb25zdCBjb25maWdfMSA9IHJlcXVpcmUoXCIuLi8uLi9jb25maWdcIik7XG5jb25zdCBwYXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInBhdGhcIikpO1xuY29uc3QgbWVkaWFfdHlwZXNfMSA9IHJlcXVpcmUoXCIuL21lZGlhLnR5cGVzXCIpO1xuY29uc3QgdXRpbF8xID0gcmVxdWlyZShcInV0aWxcIik7XG5jb25zdCBmc18xID0gX19pbXBvcnRTdGFyKHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBta0RpclByb21pc2VkID0gKDAsIHV0aWxfMS5wcm9taXNpZnkpKGZzXzEubWtkaXIpO1xuY29uc3QgZnNTdGF0UHJvbWlzZWQgPSAoMCwgdXRpbF8xLnByb21pc2lmeSkoZnNfMS5zdGF0KTtcbmNvbnN0IHdyaXRlRmlsZXIgPSAoMCwgdXRpbF8xLnByb21pc2lmeSkoZnNfMS5kZWZhdWx0LndyaXRlRmlsZSk7XG5jb25zdCByb3V0ZXIgPSBleHByZXNzXzEuZGVmYXVsdC5Sb3V0ZXIoKTtcbmNvbnN0IHN0YXRpY09wdGlvbnMgPSB7IG1heEFnZTogMzE1MzYwMDAwMDAsIGltbXV0YWJsZTogdHJ1ZSB9O1xuY29uc3QgTUVESUFfUEFUSCA9IHBhdGhfMS5kZWZhdWx0LmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ21lZGlhJyk7XG5jb25zdCBmaWxlUGF0aCA9IChmaWxlbmFtZSkgPT4gcGF0aF8xLmRlZmF1bHQuam9pbihtZWRpYV90eXBlc18xLkVNZWRpYVR5cGVzLkRvYywgYCR7RGF0ZS5ub3coKX0ke2ZpbGVuYW1lfWApO1xuZXhwb3J0cy5maWxlUGF0aCA9IGZpbGVQYXRoO1xuY29uc3Qgc2F2ZUZpbGUgPSBhc3luYyAoZmlsZW5hbWUsIGZpbGUpID0+IHtcbiAgICAvLyBlbnN1cmUgZGlyZWN0b3JpZXNcbiAgICBhd2FpdCBta0RpclByb21pc2VkKHBhdGhfMS5kZWZhdWx0LmpvaW4oTUVESUFfUEFUSCwgbWVkaWFfdHlwZXNfMS5FTWVkaWFUeXBlcy5Eb2MpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAvLyBob2xkIHByb21pc2VzIGZvciBwYXJhbGxlbCBwcm9jZXNzaW5nXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBjb25zdCByb290RmlsZVBhdGggPSBwYXRoXzEuZGVmYXVsdC5qb2luKE1FRElBX1BBVEgsICgwLCBleHBvcnRzLmZpbGVQYXRoKShmaWxlbmFtZSkpO1xuICAgIC8vIFNhdmUgdGhlIGZpbGUgdG8gZGlza1xuICAgIHByb21pc2VzLnB1c2god3JpdGVGaWxlcihyb290RmlsZVBhdGgsIGZpbGUuYnVmZmVyKSk7XG4gICAgLy8gUmV0cmlldmUgZmlsZSBzaXplIGZvciBjb25maXJtYXRpb24vcmVzcG9uc2VcbiAgICAvLyBjb25zdCBmaWxlU2l6ZSA9IChhd2FpdCBzdGF0KHJvb3RGaWxlUGF0aCkpLnNpemU7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgIHJldHVybiByb290RmlsZVBhdGg7XG59O1xuZXhwb3J0cy5zYXZlRmlsZSA9IHNhdmVGaWxlO1xucm91dGVyLnVzZSgnLycgKyBtZWRpYV90eXBlc18xLkVNZWRpYVR5cGVzLkRvYywgZXhwcmVzc18xLmRlZmF1bHQuc3RhdGljKHBhdGhfMS5kZWZhdWx0LmpvaW4oTUVESUFfUEFUSCwgbWVkaWFfdHlwZXNfMS5FTWVkaWFUeXBlcy5Eb2MpLCBzdGF0aWNPcHRpb25zKSk7XG4vKi8vIFNldCBoZWFkZXIgdG8gZm9yY2UgZG93bmxvYWRcbiAqL1xuY29uc3Qgc2V0VXBNZWRpYUVuZHBvaW50cyA9IChhcHApID0+IHtcbiAgICAvLyBtb3VudCBzdGF0aWMgc2VydmVyIGZvciBtZWRpYVxuICAgIGFwcC51c2UoJy9tZWRpYScsIHJvdXRlcik7XG59O1xuZXhwb3J0cy5zZXRVcE1lZGlhRW5kcG9pbnRzID0gc2V0VXBNZWRpYUVuZHBvaW50cztcbmNvbnN0IGdldExvY2FsTWVkaWFVcmwgPSAobWVkaWEpID0+IHtcbiAgICByZXR1cm4gYCR7Y29uZmlnXzEuY29uZmlnLk1BSU59LyR7KDAsIGV4cG9ydHMuZmlsZVBhdGgpKG1lZGlhKX1gO1xufTtcbmV4cG9ydHMuZ2V0TG9jYWxNZWRpYVVybCA9IGdldExvY2FsTWVkaWFVcmw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVnaXN0ZXJSb3V0ZXMgPSBSZWdpc3RlclJvdXRlcztcbi8qIHRzbGludDpkaXNhYmxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuY29uc3QgcnVudGltZV8xID0gcmVxdWlyZShcIkB0c29hL3J1bnRpbWVcIik7XG4vLyBXQVJOSU5HOiBUaGlzIGZpbGUgd2FzIGF1dG8tZ2VuZXJhdGVkIHdpdGggdHNvYS4gUGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQuIFJlLXJ1biB0c29hIHRvIHJlLWdlbmVyYXRlIHRoaXMgZmlsZTogaHR0cHM6Ly9naXRodWIuY29tL2x1a2VhdXRyeS90c29hXG5jb25zdCBjaGF0X2NvbnRyb2xsZXJfMSA9IHJlcXVpcmUoXCIuLy4uL21vZHVsZXMvY2hhdC9jaGF0LmNvbnRyb2xsZXJcIik7XG5jb25zdCBtdWx0ZXIgPSByZXF1aXJlKCdtdWx0ZXInKTtcbi8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbmNvbnN0IG1vZGVscyA9IHt9O1xuY29uc3QgdGVtcGxhdGVTZXJ2aWNlID0gbmV3IHJ1bnRpbWVfMS5FeHByZXNzVGVtcGxhdGVTZXJ2aWNlKG1vZGVscywgeyBcIm5vSW1wbGljaXRBZGRpdGlvbmFsUHJvcGVydGllc1wiOiBcInRocm93LW9uLWV4dHJhc1wiLCBcImJvZHlDb2VyY2lvblwiOiB0cnVlIH0pO1xuLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuZnVuY3Rpb24gUmVnaXN0ZXJSb3V0ZXMoYXBwLCBvcHRzKSB7XG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyAgTk9URTogSWYgeW91IGRvIG5vdCBzZWUgcm91dGVzIGZvciBhbGwgb2YgeW91ciBjb250cm9sbGVycyBpbiB0aGlzIGZpbGUsIHRoZW4geW91IG1pZ2h0IG5vdCBoYXZlIGluZm9ybWVkIHRzb2Egb2Ygd2hlcmUgdG8gbG9va1xuICAgIC8vICAgICAgUGxlYXNlIGxvb2sgaW50byB0aGUgXCJjb250cm9sbGVyUGF0aEdsb2JzXCIgY29uZmlnIG9wdGlvbiBkZXNjcmliZWQgaW4gdGhlIHJlYWRtZTogaHR0cHM6Ly9naXRodWIuY29tL2x1a2VhdXRyeS90c29hXG4gICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICBjb25zdCB1cGxvYWQgPSBvcHRzPy5tdWx0ZXIgfHwgbXVsdGVyKHsgXCJsaW1pdHNcIjogeyBcImZpbGVTaXplXCI6IDMxNDU3MjgwMCB9IH0pO1xuICAgIGFwcC5wb3N0KCcvY2hhdC91cGxvYWQnLCB1cGxvYWQuZmllbGRzKFt7IFwibmFtZVwiOiBcImZpbGVcIiwgXCJtYXhDb3VudFwiOiAxLCBcIm11bHRpcGxlXCI6IGZhbHNlIH1dKSwgLi4uKCgwLCBydW50aW1lXzEuZmV0Y2hNaWRkbGV3YXJlcykoY2hhdF9jb250cm9sbGVyXzEuQ2hhdENvbnRyb2xsZXIpKSwgLi4uKCgwLCBydW50aW1lXzEuZmV0Y2hNaWRkbGV3YXJlcykoY2hhdF9jb250cm9sbGVyXzEuQ2hhdENvbnRyb2xsZXIucHJvdG90eXBlLnVwbG9hZERvY3VtZW50KSksIGFzeW5jIGZ1bmN0aW9uIENoYXRDb250cm9sbGVyX3VwbG9hZERvY3VtZW50KHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSB7XG4gICAgICAgICAgICBmaWxlOiB7IFwiaW5cIjogXCJmb3JtRGF0YVwiLCBcIm5hbWVcIjogXCJmaWxlXCIsIFwicmVxdWlyZWRcIjogdHJ1ZSwgXCJkYXRhVHlwZVwiOiBcImZpbGVcIiB9LFxuICAgICAgICAgICAgdGl0bGU6IHsgXCJpblwiOiBcImZvcm1EYXRhXCIsIFwibmFtZVwiOiBcInRpdGxlXCIsIFwicmVxdWlyZWRcIjogdHJ1ZSwgXCJkYXRhVHlwZVwiOiBcInN0cmluZ1wiIH0sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogeyBcImluXCI6IFwiZm9ybURhdGFcIiwgXCJuYW1lXCI6IFwiZGVzY3JpcHRpb25cIiwgXCJyZXF1aXJlZFwiOiB0cnVlLCBcImRhdGFUeXBlXCI6IFwic3RyaW5nXCIgfSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuICAgICAgICBsZXQgdmFsaWRhdGVkQXJncyA9IFtdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFsaWRhdGVkQXJncyA9IHRlbXBsYXRlU2VydmljZS5nZXRWYWxpZGF0ZWRBcmdzKHsgYXJncywgcmVxdWVzdCwgcmVzcG9uc2UgfSk7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IGNoYXRfY29udHJvbGxlcl8xLkNoYXRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICBhd2FpdCB0ZW1wbGF0ZVNlcnZpY2UuYXBpSGFuZGxlcih7XG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogJ3VwbG9hZERvY3VtZW50JyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIG5leHQsXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkQXJncyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzU3RhdHVzOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChlcnIpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuICAgIGFwcC5nZXQoJy9jaGF0L2dldERvY3VtZW50cycsIC4uLigoMCwgcnVudGltZV8xLmZldGNoTWlkZGxld2FyZXMpKGNoYXRfY29udHJvbGxlcl8xLkNoYXRDb250cm9sbGVyKSksIC4uLigoMCwgcnVudGltZV8xLmZldGNoTWlkZGxld2FyZXMpKGNoYXRfY29udHJvbGxlcl8xLkNoYXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXREb2N1bWVudHMpKSwgYXN5bmMgZnVuY3Rpb24gQ2hhdENvbnRyb2xsZXJfZ2V0RG9jdW1lbnRzKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSB7fTtcbiAgICAgICAgLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuICAgICAgICBsZXQgdmFsaWRhdGVkQXJncyA9IFtdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFsaWRhdGVkQXJncyA9IHRlbXBsYXRlU2VydmljZS5nZXRWYWxpZGF0ZWRBcmdzKHsgYXJncywgcmVxdWVzdCwgcmVzcG9uc2UgfSk7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IGNoYXRfY29udHJvbGxlcl8xLkNoYXRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICBhd2FpdCB0ZW1wbGF0ZVNlcnZpY2UuYXBpSGFuZGxlcih7XG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogJ2dldERvY3VtZW50cycsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcixcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICBuZXh0LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZEFyZ3MsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1N0YXR1czogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbiAgICBhcHAucG9zdCgnL2NoYXQvcmVjb21tZW5kQm9va3MnLCAuLi4oKDAsIHJ1bnRpbWVfMS5mZXRjaE1pZGRsZXdhcmVzKShjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlcikpLCAuLi4oKDAsIHJ1bnRpbWVfMS5mZXRjaE1pZGRsZXdhcmVzKShjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlci5wcm90b3R5cGUuYXNrUXVlc3Rpb24pKSwgYXN5bmMgZnVuY3Rpb24gQ2hhdENvbnRyb2xsZXJfYXNrUXVlc3Rpb24ocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgICAgIGJvZHk6IHsgXCJpblwiOiBcImJvZHlcIiwgXCJuYW1lXCI6IFwiYm9keVwiLCBcInJlcXVpcmVkXCI6IHRydWUsIFwiZGF0YVR5cGVcIjogXCJuZXN0ZWRPYmplY3RMaXRlcmFsXCIsIFwibmVzdGVkUHJvcGVydGllc1wiOiB7IFwicXVlc3Rpb25zXCI6IHsgXCJkYXRhVHlwZVwiOiBcInN0cmluZ1wiLCBcInJlcXVpcmVkXCI6IHRydWUgfSB9IH0sXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbiAgICAgICAgbGV0IHZhbGlkYXRlZEFyZ3MgPSBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhbGlkYXRlZEFyZ3MgPSB0ZW1wbGF0ZVNlcnZpY2UuZ2V0VmFsaWRhdGVkQXJncyh7IGFyZ3MsIHJlcXVlc3QsIHJlc3BvbnNlIH0pO1xuICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgYXdhaXQgdGVtcGxhdGVTZXJ2aWNlLmFwaUhhbmRsZXIoe1xuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdhc2tRdWVzdGlvbicsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcixcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICBuZXh0LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZEFyZ3MsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1N0YXR1czogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbiAgICBhcHAucG9zdCgnL2NoYXQvYXNrUXVlc3Rpb25BYm91dEJvb2snLCAuLi4oKDAsIHJ1bnRpbWVfMS5mZXRjaE1pZGRsZXdhcmVzKShjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlcikpLCAuLi4oKDAsIHJ1bnRpbWVfMS5mZXRjaE1pZGRsZXdhcmVzKShjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlci5wcm90b3R5cGUuYXNrUXVlc3Rpb25BYm91dEJvb2spKSwgYXN5bmMgZnVuY3Rpb24gQ2hhdENvbnRyb2xsZXJfYXNrUXVlc3Rpb25BYm91dEJvb2socmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgICAgIGJvZHk6IHsgXCJpblwiOiBcImJvZHlcIiwgXCJuYW1lXCI6IFwiYm9keVwiLCBcInJlcXVpcmVkXCI6IHRydWUsIFwiZGF0YVR5cGVcIjogXCJuZXN0ZWRPYmplY3RMaXRlcmFsXCIsIFwibmVzdGVkUHJvcGVydGllc1wiOiB7IFwidGl0bGVcIjogeyBcImRhdGFUeXBlXCI6IFwic3RyaW5nXCIsIFwicmVxdWlyZWRcIjogdHJ1ZSB9LCBcInF1ZXN0aW9uXCI6IHsgXCJkYXRhVHlwZVwiOiBcInN0cmluZ1wiLCBcInJlcXVpcmVkXCI6IHRydWUgfSB9IH0sXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbiAgICAgICAgbGV0IHZhbGlkYXRlZEFyZ3MgPSBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhbGlkYXRlZEFyZ3MgPSB0ZW1wbGF0ZVNlcnZpY2UuZ2V0VmFsaWRhdGVkQXJncyh7IGFyZ3MsIHJlcXVlc3QsIHJlc3BvbnNlIH0pO1xuICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBjaGF0X2NvbnRyb2xsZXJfMS5DaGF0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgYXdhaXQgdGVtcGxhdGVTZXJ2aWNlLmFwaUhhbmRsZXIoe1xuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdhc2tRdWVzdGlvbkFib3V0Qm9vaycsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcixcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICBuZXh0LFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZEFyZ3MsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc1N0YXR1czogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFdBUk5JTkc6IFRoaXMgZmlsZSB3YXMgYXV0by1nZW5lcmF0ZWQgd2l0aCB0c29hLiBQbGVhc2UgZG8gbm90IG1vZGlmeSBpdC4gUmUtcnVuIHRzb2EgdG8gcmUtZ2VuZXJhdGUgdGhpcyBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vbHVrZWF1dHJ5L3Rzb2FcbiAgICAvLyBXQVJOSU5HOiBUaGlzIGZpbGUgd2FzIGF1dG8tZ2VuZXJhdGVkIHdpdGggdHNvYS4gUGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQuIFJlLXJ1biB0c29hIHRvIHJlLWdlbmVyYXRlIHRoaXMgZmlsZTogaHR0cHM6Ly9naXRodWIuY29tL2x1a2VhdXRyeS90c29hXG4gICAgLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxufVxuLy8gV0FSTklORzogVGhpcyBmaWxlIHdhcyBhdXRvLWdlbmVyYXRlZCB3aXRoIHRzb2EuIFBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LiBSZS1ydW4gdHNvYSB0byByZS1nZW5lcmF0ZSB0aGlzIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9sdWtlYXV0cnkvdHNvYVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9jb21tdW5pdHkvZG9jdW1lbnRfbG9hZGVycy9mcy9wZGZcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9jb3JlL3Byb21wdHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9vcGVuYWlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQGxhbmdjaGFpbi9waW5lY29uZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJAbGFuZ2NoYWluL3RleHRzcGxpdHRlcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiQHBpbmVjb25lLWRhdGFiYXNlL3BpbmVjb25lXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIkB0c29hL3J1bnRpbWVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJkb3RlbnZcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoZWxtZXRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGFuZ2NoYWluL2NoYWlucy9jb21iaW5lX2RvY3VtZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsYW5nY2hhaW4vY2hhaW5zL3JldHJpZXZhbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJtdWx0ZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGRmLXBhcnNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInN3YWdnZXItdWktZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ0c29hXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjb25maWdfMSA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcbigwLCBjb25maWdfMS5zZXR1cFNlcnZlcikoKS50aGVuKChhcHApID0+IHtcbiAgICBhcHAubGlzdGVuKGNvbmZpZ18xLmNvbmZpZy5TRVJWRVJfUE9SVCwgKCkgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhg8J+agCBTZXJ2ZXIgc3RhcnRlZCBvbiBwb3J0ICR7Y29uZmlnXzEuY29uZmlnLlNFUlZFUl9QT1JUfSAoJHtjb25maWdfMS5jb25maWcuTk9ERV9FTlZ9KWApO1xuICAgIH0pO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=