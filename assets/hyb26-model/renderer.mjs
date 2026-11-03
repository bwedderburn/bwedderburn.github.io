// Adapted HYB26 renderer. See LICENSE-UPSTREAM.txt and docs/portfolio/HYB26-MODEL.md. Do not edit this generated bundle.

// portfolio/assets/hyb26-model/source/badge-editor-model.ts
import { Box3 as Box32, CanvasTexture as CanvasTexture2, DirectionalLight as DirectionalLight2, DoubleSide as DoubleSide3, Group as Group2, HemisphereLight, LinearFilter as LinearFilter2, Mesh as Mesh2, MeshBasicMaterial as MeshBasicMaterial3, NearestFilter as NearestFilter2, PerspectiveCamera as PerspectiveCamera2, Raycaster, Scene, SRGBColorSpace as SRGBColorSpace3, Vector2 as Vector24, Vector3 as Vector37, WebGLRenderer } from "../vendor/three/three.module.js";

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/loaders/GLTFLoader.js
import {
  AnimationClip as AnimationClip2,
  Bone,
  Box3,
  BufferAttribute as BufferAttribute2,
  BufferGeometry as BufferGeometry2,
  ClampToEdgeWrapping,
  Color,
  ColorManagement,
  DirectionalLight,
  DoubleSide,
  FileLoader,
  FrontSide,
  Group,
  ImageBitmapLoader,
  InstancedMesh,
  InterleavedBuffer as InterleavedBuffer2,
  InterleavedBufferAttribute as InterleavedBufferAttribute2,
  Interpolant,
  InterpolateDiscrete,
  InterpolateLinear,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  LinearSRGBColorSpace,
  Loader,
  LoaderUtils,
  Material,
  MathUtils,
  Matrix4 as Matrix42,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NumberKeyframeTrack,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  PropertyBinding,
  Quaternion as Quaternion2,
  QuaternionKeyframeTrack as QuaternionKeyframeTrack2,
  RepeatWrapping,
  Skeleton,
  SkinnedMesh,
  Sphere,
  SpotLight,
  Texture,
  TextureLoader,
  TriangleFanDrawMode as TriangleFanDrawMode2,
  TriangleStripDrawMode as TriangleStripDrawMode2,
  Vector2,
  Vector3 as Vector33,
  VectorKeyframeTrack as VectorKeyframeTrack2,
  SRGBColorSpace,
  InstancedBufferAttribute as InstancedBufferAttribute2
} from "../vendor/three/three.module.js";

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  TriangleFanDrawMode,
  TriangleStripDrawMode,
  TrianglesDrawMode,
  Vector3
} from "../vendor/three/three.module.js";
function toTrianglesDrawMode(geometry, drawMode) {
  if (drawMode === TrianglesDrawMode) {
    console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
    return geometry;
  }
  if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
    let index = geometry.getIndex();
    if (index === null) {
      const indices = [];
      const position = geometry.getAttribute("position");
      if (position !== void 0) {
        for (let i = 0; i < position.count; i++) {
          indices.push(i);
        }
        geometry.setIndex(indices);
        index = geometry.getIndex();
      } else {
        console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
        return geometry;
      }
    }
    const numberOfTriangles = index.count - 2;
    const newIndices = [];
    if (drawMode === TriangleFanDrawMode) {
      for (let i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0));
        newIndices.push(index.getX(i));
        newIndices.push(index.getX(i + 1));
      }
    } else {
      for (let i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i + 2));
        } else {
          newIndices.push(index.getX(i + 2));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i));
        }
      }
    }
    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    }
    geometry.setIndex(newIndices);
    geometry.clearGroups();
    return geometry;
  } else {
    console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
    return geometry;
  }
}

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/utils/SkeletonUtils.js
import {
  AnimationClip,
  AnimationMixer,
  Matrix4,
  Quaternion,
  QuaternionKeyframeTrack,
  SkeletonHelper,
  Vector3 as Vector32,
  VectorKeyframeTrack
} from "../vendor/three/three.module.js";
function clone(source) {
  const sourceLookup = /* @__PURE__ */ new Map();
  const cloneLookup = /* @__PURE__ */ new Map();
  const clone2 = source.clone();
  parallelTraverse(source, clone2, function(sourceNode, clonedNode) {
    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);
  });
  clone2.traverse(function(node) {
    if (!node.isSkinnedMesh) return;
    const clonedMesh = node;
    const sourceMesh = sourceLookup.get(node);
    const sourceBones = sourceMesh.skeleton.bones;
    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
    clonedMesh.skeleton.bones = sourceBones.map(function(bone) {
      return cloneLookup.get(bone);
    });
    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
  });
  return clone2;
}
function parallelTraverse(a, b, callback) {
  callback(a, b);
  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback);
  }
}

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/loaders/GLTFLoader.js
var GLTFLoader = class extends Loader {
  /**
   * Constructs a new glTF loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(manager) {
    super(manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
    this.pluginCallbacks = [];
    this.register(function(parser) {
      return new GLTFMaterialsClearcoatExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsDispersionExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureBasisUExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureWebPExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureAVIFExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsSheenExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsTransmissionExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsVolumeExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsIorExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsSpecularExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsIridescenceExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsAnisotropyExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsBumpExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFLightsExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMeshoptCompression(parser, EXTENSIONS.EXT_MESHOPT_COMPRESSION);
    });
    this.register(function(parser) {
      return new GLTFMeshoptCompression(parser, EXTENSIONS.KHR_MESHOPT_COMPRESSION);
    });
    this.register(function(parser) {
      return new GLTFMeshGpuInstancing(parser);
    });
  }
  /**
   * Starts loading from the given URL and passes the loaded glTF asset
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    let resourcePath;
    if (this.resourcePath !== "") {
      resourcePath = this.resourcePath;
    } else if (this.path !== "") {
      const relativeUrl = LoaderUtils.extractUrlBase(url);
      resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url);
    }
    this.manager.itemStart(url);
    const _onError = function(e) {
      if (onError) {
        onError(e);
      } else {
        console.error(e);
      }
      scope.manager.itemError(url);
      scope.manager.itemEnd(url);
    };
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType("arraybuffer");
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function(data) {
      try {
        scope.parse(data, resourcePath, function(gltf) {
          onLoad(gltf);
          scope.manager.itemEnd(url);
        }, _onError);
      } catch (e) {
        _onError(e);
      }
    }, onProgress, _onError);
  }
  /**
   * Sets the given Draco loader to this loader. Required for decoding assets
   * compressed with the `KHR_draco_mesh_compression` extension.
   *
   * @param {DRACOLoader} dracoLoader - The Draco loader to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setDRACOLoader(dracoLoader) {
    this.dracoLoader = dracoLoader;
    return this;
  }
  /**
   * Sets the given KTX2 loader to this loader. Required for loading KTX2
   * compressed textures.
   *
   * @param {KTX2Loader} ktx2Loader - The KTX2 loader to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setKTX2Loader(ktx2Loader) {
    this.ktx2Loader = ktx2Loader;
    return this;
  }
  /**
   * Sets the given meshopt decoder. Required for decoding assets
   * compressed with the `EXT_meshopt_compression` extension.
   *
   * @param {Object} meshoptDecoder - The meshopt decoder to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setMeshoptDecoder(meshoptDecoder) {
    this.meshoptDecoder = meshoptDecoder;
    return this;
  }
  /**
   * Registers a plugin callback. This API is internally used to implement the various
   * glTF extensions but can also used by third-party code to add additional logic
   * to the loader.
   *
   * @param {function(parser:GLTFParser)} callback - The callback function to register.
   * @return {GLTFLoader} A reference to this loader.
   */
  register(callback) {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback);
    }
    return this;
  }
  /**
   * Unregisters a plugin callback.
   *
   * @param {Function} callback - The callback function to unregister.
   * @return {GLTFLoader} A reference to this loader.
   */
  unregister(callback) {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
    }
    return this;
  }
  /**
   * Parses the given glTF data and returns the resulting group.
   *
   * @param {string|ArrayBuffer} data - The raw glTF data.
   * @param {string} path - The URL base path.
   * @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  parse(data, path, onLoad, onError) {
    let json;
    const extensions = {};
    const plugins = {};
    const textDecoder = new TextDecoder();
    if (typeof data === "string") {
      json = JSON.parse(data);
    } else if (data instanceof ArrayBuffer) {
      const magic = textDecoder.decode(new Uint8Array(data, 0, 4));
      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
        } catch (error) {
          if (onError) onError(error);
          return;
        }
        json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
      } else {
        json = JSON.parse(textDecoder.decode(data));
      }
    } else {
      json = data;
    }
    if (json.asset === void 0 || json.asset.version[0] < 2) {
      if (onError) onError(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    parser.fileLoader.setRequestHeader(this.requestHeader);
    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser);
      if (!plugin.name) console.error("THREE.GLTFLoader: Invalid plugin found: missing name");
      plugins[plugin.name] = plugin;
      extensions[plugin.name] = true;
    }
    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i];
        const extensionsRequired = json.extensionsRequired || [];
        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension();
            break;
          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
            break;
          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension();
            break;
          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension();
            break;
          default:
            if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) {
              console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
            }
        }
      }
    }
    parser.setExtensions(extensions);
    parser.setPlugins(plugins);
    parser.parse(onLoad, onError);
  }
  /**
   * Async version of {@link GLTFLoader#parse}.
   *
   * @async
   * @param {string|ArrayBuffer} data - The raw glTF data.
   * @param {string} path - The URL base path.
   * @return {Promise<GLTFLoader~LoadObject>} A Promise that resolves with the loaded glTF when the parsing has been finished.
   */
  parseAsync(data, path) {
    const scope = this;
    return new Promise(function(resolve, reject) {
      scope.parse(data, path, resolve, reject);
    });
  }
};
function GLTFRegistry() {
  let objects = {};
  return {
    get: function(key) {
      return objects[key];
    },
    add: function(key, object) {
      objects[key] = object;
    },
    remove: function(key) {
      delete objects[key];
    },
    removeAll: function() {
      objects = {};
    }
  };
}
function getMaterialExtension(parser, materialIndex, extensionName) {
  const materialDef = parser.json.materials[materialIndex];
  if (materialDef.extensions && materialDef.extensions[extensionName]) {
    return materialDef.extensions[extensionName];
  }
  return null;
}
var EXTENSIONS = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  KHR_MESHOPT_COMPRESSION: "KHR_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
var GLTFLightsExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
    this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const parser = this.parser;
    const nodeDefs = this.parser.json.nodes || [];
    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
      }
    }
  }
  _loadLight(lightIndex) {
    const parser = this.parser;
    const cacheKey = "light:" + lightIndex;
    let dependency = parser.cache.get(cacheKey);
    if (dependency) return dependency;
    const json = parser.json;
    const extensions = json.extensions && json.extensions[this.name] || {};
    const lightDefs = extensions.lights || [];
    const lightDef = lightDefs[lightIndex];
    let lightNode;
    const color = new Color(16777215);
    if (lightDef.color !== void 0) color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);
    const range = lightDef.range !== void 0 ? lightDef.range : 0;
    switch (lightDef.type) {
      case "directional":
        lightNode = new DirectionalLight(color);
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      case "point":
        lightNode = new PointLight(color);
        lightNode.distance = range;
        break;
      case "spot":
        lightNode = new SpotLight(color);
        lightNode.distance = range;
        lightDef.spot = lightDef.spot || {};
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
        lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
        lightNode.angle = lightDef.spot.outerConeAngle;
        lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + lightDef.type);
    }
    lightNode.position.set(0, 0, 0);
    assignExtrasToUserData(lightNode, lightDef);
    if (lightDef.intensity !== void 0) lightNode.intensity = lightDef.intensity;
    lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
    dependency = Promise.resolve(lightNode);
    parser.cache.add(cacheKey, dependency);
    return dependency;
  }
  getDependency(type, index) {
    if (type !== "light") return;
    return this._loadLight(index);
  }
  createNodeAttachment(nodeIndex) {
    const self2 = this;
    const parser = this.parser;
    const json = parser.json;
    const nodeDef = json.nodes[nodeIndex];
    const lightDef = nodeDef.extensions && nodeDef.extensions[this.name] || {};
    const lightIndex = lightDef.light;
    if (lightIndex === void 0) return null;
    return this._loadLight(lightIndex).then(function(light) {
      return parser._getNodeRef(self2.cache, lightIndex, light);
    });
  }
};
var GLTFMaterialsUnlitExtension = class {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return MeshBasicMaterial;
  }
  extendParams(materialParams, materialDef, parser) {
    const pending = [];
    materialParams.color = new Color(1, 1, 1);
    materialParams.opacity = 1;
    const metallicRoughness = materialDef.pbrMetallicRoughness;
    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor;
        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
      }
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsEmissiveStrengthExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    if (extension.emissiveStrength !== void 0) {
      materialParams.emissiveIntensity = extension.emissiveStrength;
    }
    return Promise.resolve();
  }
};
var GLTFMaterialsClearcoatExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    if (extension.clearcoatFactor !== void 0) {
      materialParams.clearcoat = extension.clearcoatFactor;
    }
    if (extension.clearcoatTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
    }
    if (extension.clearcoatRoughnessFactor !== void 0) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
    }
    if (extension.clearcoatRoughnessTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
    }
    if (extension.clearcoatNormalTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
      if (extension.clearcoatNormalTexture.scale !== void 0) {
        const scale = extension.clearcoatNormalTexture.scale;
        materialParams.clearcoatNormalScale = new Vector2(scale, scale);
      }
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsDispersionExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    materialParams.dispersion = extension.dispersion !== void 0 ? extension.dispersion : 0;
    return Promise.resolve();
  }
};
var GLTFMaterialsIridescenceExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    if (extension.iridescenceFactor !== void 0) {
      materialParams.iridescence = extension.iridescenceFactor;
    }
    if (extension.iridescenceTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "iridescenceMap", extension.iridescenceTexture));
    }
    if (extension.iridescenceIor !== void 0) {
      materialParams.iridescenceIOR = extension.iridescenceIor;
    }
    if (materialParams.iridescenceThicknessRange === void 0) {
      materialParams.iridescenceThicknessRange = [100, 400];
    }
    if (extension.iridescenceThicknessMinimum !== void 0) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
    }
    if (extension.iridescenceThicknessMaximum !== void 0) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
    }
    if (extension.iridescenceThicknessTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "iridescenceThicknessMap", extension.iridescenceThicknessTexture));
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsSheenExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    materialParams.sheenColor = new Color(0, 0, 0);
    materialParams.sheenRoughness = 0;
    materialParams.sheen = 1;
    if (extension.sheenColorFactor !== void 0) {
      const colorFactor = extension.sheenColorFactor;
      materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace);
    }
    if (extension.sheenRoughnessFactor !== void 0) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor;
    }
    if (extension.sheenColorTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "sheenColorMap", extension.sheenColorTexture, SRGBColorSpace));
    }
    if (extension.sheenRoughnessTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "sheenRoughnessMap", extension.sheenRoughnessTexture));
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsTransmissionExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    if (extension.transmissionFactor !== void 0) {
      materialParams.transmission = extension.transmissionFactor;
    }
    if (extension.transmissionTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsVolumeExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    materialParams.thickness = extension.thicknessFactor !== void 0 ? extension.thicknessFactor : 0;
    if (extension.thicknessTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "thicknessMap", extension.thicknessTexture));
    }
    materialParams.attenuationDistance = extension.attenuationDistance || Infinity;
    const colorArray = extension.attenuationColor || [1, 1, 1];
    materialParams.attenuationColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
    return Promise.all(pending);
  }
};
var GLTFMaterialsIorExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_IOR;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    materialParams.ior = extension.ior !== void 0 ? extension.ior : 1.5;
    if (materialParams.ior === 0) materialParams.ior = 1e3;
    return Promise.resolve();
  }
};
var GLTFMaterialsSpecularExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    materialParams.specularIntensity = extension.specularFactor !== void 0 ? extension.specularFactor : 1;
    if (extension.specularTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "specularIntensityMap", extension.specularTexture));
    }
    const colorArray = extension.specularColorFactor || [1, 1, 1];
    materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
    if (extension.specularColorTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "specularColorMap", extension.specularColorTexture, SRGBColorSpace));
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsBumpExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_MATERIALS_BUMP;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    materialParams.bumpScale = extension.bumpFactor !== void 0 ? extension.bumpFactor : 1;
    if (extension.bumpTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "bumpMap", extension.bumpTexture));
    }
    return Promise.all(pending);
  }
};
var GLTFMaterialsAnisotropyExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(materialIndex) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    return extension !== null ? MeshPhysicalMaterial : null;
  }
  extendMaterialParams(materialIndex, materialParams) {
    const extension = getMaterialExtension(this.parser, materialIndex, this.name);
    if (extension === null) return Promise.resolve();
    const pending = [];
    if (extension.anisotropyStrength !== void 0) {
      materialParams.anisotropy = extension.anisotropyStrength;
    }
    if (extension.anisotropyRotation !== void 0) {
      materialParams.anisotropyRotation = extension.anisotropyRotation;
    }
    if (extension.anisotropyTexture !== void 0) {
      pending.push(this.parser.assignTexture(materialParams, "anisotropyMap", extension.anisotropyTexture));
    }
    return Promise.all(pending);
  }
};
var GLTFTextureBasisUExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
  }
  loadTexture(textureIndex) {
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null;
    }
    const extension = textureDef.extensions[this.name];
    const loader = parser.options.ktx2Loader;
    if (!loader) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      } else {
        return null;
      }
    }
    return parser.loadTextureImage(textureIndex, extension.source, loader);
  }
};
var GLTFTextureWebPExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
  }
  loadTexture(textureIndex) {
    const name = this.name;
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }
    const extension = textureDef.extensions[name];
    const source = json.images[extension.source];
    let loader = parser.textureLoader;
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri);
      if (handler !== null) loader = handler;
    }
    return parser.loadTextureImage(textureIndex, extension.source, loader);
  }
};
var GLTFTextureAVIFExtension = class {
  constructor(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
  }
  loadTexture(textureIndex) {
    const name = this.name;
    const parser = this.parser;
    const json = parser.json;
    const textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }
    const extension = textureDef.extensions[name];
    const source = json.images[extension.source];
    let loader = parser.textureLoader;
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri);
      if (handler !== null) loader = handler;
    }
    return parser.loadTextureImage(textureIndex, extension.source, loader);
  }
};
var GLTFMeshoptCompression = class {
  constructor(parser, name) {
    this.name = name;
    this.parser = parser;
  }
  loadBufferView(index) {
    const json = this.parser.json;
    const bufferView = json.bufferViews[index];
    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name];
      const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
      const decoder = this.parser.options.meshoptDecoder;
      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        } else {
          return null;
        }
      }
      return buffer.then(function(res) {
        const byteOffset = extensionDef.byteOffset || 0;
        const byteLength = extensionDef.byteLength || 0;
        const count = extensionDef.count;
        const stride = extensionDef.byteStride;
        const source = new Uint8Array(res, byteOffset, byteLength);
        if (decoder.decodeGltfBufferAsync) {
          return decoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(function(res2) {
            return res2.buffer;
          });
        } else {
          return decoder.ready.then(function() {
            const result = new ArrayBuffer(count * stride);
            decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
            return result;
          });
        }
      });
    } else {
      return null;
    }
  }
};
var GLTFMeshGpuInstancing = class {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
    this.parser = parser;
  }
  createNodeMesh(nodeIndex) {
    const json = this.parser.json;
    const nodeDef = json.nodes[nodeIndex];
    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === void 0) {
      return null;
    }
    const meshDef = json.meshes[nodeDef.mesh];
    for (const primitive of meshDef.primitives) {
      if (primitive.mode !== WEBGL_CONSTANTS.TRIANGLES && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN && primitive.mode !== void 0) {
        return null;
      }
    }
    const extensionDef = nodeDef.extensions[this.name];
    const attributesDef = extensionDef.attributes;
    const pending = [];
    const attributes = {};
    for (const key in attributesDef) {
      pending.push(this.parser.getDependency("accessor", attributesDef[key]).then((accessor) => {
        attributes[key] = accessor;
        return attributes[key];
      }));
    }
    if (pending.length < 1) {
      return null;
    }
    pending.push(this.parser.createNodeMesh(nodeIndex));
    return Promise.all(pending).then((results) => {
      const nodeObject = results.pop();
      const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
      const count = results[0].count;
      const instancedMeshes = [];
      for (const mesh of meshes) {
        const m = new Matrix42();
        const p = new Vector33();
        const q = new Quaternion2();
        const s = new Vector33(1, 1, 1);
        const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);
        for (let i = 0; i < count; i++) {
          if (attributes.TRANSLATION) {
            p.fromBufferAttribute(attributes.TRANSLATION, i);
          }
          if (attributes.ROTATION) {
            q.fromBufferAttribute(attributes.ROTATION, i);
          }
          if (attributes.SCALE) {
            s.fromBufferAttribute(attributes.SCALE, i);
          }
          instancedMesh.setMatrixAt(i, m.compose(p, q, s));
        }
        let instanceGeometry = null;
        for (const attributeName in attributes) {
          if (attributeName === "_COLOR_0") {
            const attr = attributes[attributeName];
            instancedMesh.instanceColor = new InstancedBufferAttribute2(attr.array, attr.itemSize, attr.normalized);
          } else if (attributeName !== "TRANSLATION" && attributeName !== "ROTATION" && attributeName !== "SCALE") {
            if (instanceGeometry === null) {
              const source = instancedMesh.geometry;
              instanceGeometry = new BufferGeometry2();
              instanceGeometry.name = source.name;
              for (const name in source.attributes) instanceGeometry.setAttribute(name, source.attributes[name]);
              for (const name in source.morphAttributes) instanceGeometry.morphAttributes[name] = source.morphAttributes[name];
              if (source.index !== null) instanceGeometry.setIndex(source.index);
              instanceGeometry.morphTargetsRelative = source.morphTargetsRelative;
              for (const group of source.groups) instanceGeometry.addGroup(group.start, group.count, group.materialIndex);
              if (source.boundingBox !== null) instanceGeometry.boundingBox = source.boundingBox.clone();
              if (source.boundingSphere !== null) instanceGeometry.boundingSphere = source.boundingSphere.clone();
              instanceGeometry.drawRange.start = source.drawRange.start;
              instanceGeometry.drawRange.count = source.drawRange.count;
              instanceGeometry.userData = Object.assign({}, source.userData);
              instancedMesh.geometry = instanceGeometry;
            }
            const attr = attributes[attributeName];
            instanceGeometry.setAttribute(attributeName, new InstancedBufferAttribute2(attr.array, attr.itemSize, attr.normalized));
          }
        }
        Object3D.prototype.copy.call(instancedMesh, mesh);
        this.parser.assignFinalMaterial(instancedMesh);
        instancedMeshes.push(instancedMesh);
      }
      if (nodeObject.isGroup) {
        nodeObject.clear();
        nodeObject.add(...instancedMeshes);
        return nodeObject;
      }
      return instancedMeshes[0];
    });
  }
};
var BINARY_EXTENSION_HEADER_MAGIC = "glTF";
var BINARY_EXTENSION_HEADER_LENGTH = 12;
var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 1313821514, BIN: 5130562 };
var GLTFBinaryExtension = class {
  constructor(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF;
    this.content = null;
    this.body = null;
    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
    const textDecoder = new TextDecoder();
    this.header = {
      magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    };
    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    } else if (this.header.version < 2) {
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    }
    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
    let chunkIndex = 0;
    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      const chunkType = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
        this.content = textDecoder.decode(contentArray);
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        this.body = data.slice(byteOffset, byteOffset + chunkLength);
      }
      chunkIndex += chunkLength;
    }
    if (this.content === null) {
      throw new Error("THREE.GLTFLoader: JSON content not found.");
    }
  }
};
var GLTFDracoMeshCompressionExtension = class {
  constructor(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    }
    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
    this.json = json;
    this.dracoLoader = dracoLoader;
    this.dracoLoader.preload();
  }
  decodePrimitive(primitive, parser) {
    const json = this.json;
    const dracoLoader = this.dracoLoader;
    const bufferViewIndex = primitive.extensions[this.name].bufferView;
    const gltfAttributeMap = primitive.extensions[this.name].attributes;
    const threeAttributeMap = {};
    const attributeNormalizedMap = {};
    const attributeTypeMap = {};
    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
    }
    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      if (gltfAttributeMap[attributeName] !== void 0) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]];
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        attributeTypeMap[threeAttributeName] = componentType.name;
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
      }
    }
    return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
      return new Promise(function(resolve, reject) {
        dracoLoader.decodeDracoFile(bufferView, function(geometry) {
          for (const attributeName in geometry.attributes) {
            const attribute = geometry.attributes[attributeName];
            const normalized = attributeNormalizedMap[attributeName];
            if (normalized !== void 0) attribute.normalized = normalized;
          }
          resolve(geometry);
        }, threeAttributeMap, attributeTypeMap, LinearSRGBColorSpace, reject);
      });
    });
  }
};
var GLTFTextureTransformExtension = class {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(texture, transform) {
    if ((transform.texCoord === void 0 || transform.texCoord === texture.channel) && transform.offset === void 0 && transform.rotation === void 0 && transform.scale === void 0) {
      return texture;
    }
    texture = texture.clone();
    if (transform.texCoord !== void 0) {
      texture.channel = transform.texCoord;
    }
    if (transform.offset !== void 0) {
      texture.offset.fromArray(transform.offset);
    }
    if (transform.rotation !== void 0) {
      texture.rotation = transform.rotation;
    }
    if (transform.scale !== void 0) {
      texture.repeat.fromArray(transform.scale);
    }
    if (transform.rotation !== void 0) {
      const c = Math.cos(texture.rotation);
      const s = Math.sin(texture.rotation);
      texture.matrix.set(
        texture.repeat.x * c,
        texture.repeat.y * s,
        texture.offset.x,
        -texture.repeat.x * s,
        texture.repeat.y * c,
        texture.offset.y,
        0,
        0,
        1
      );
      texture.matrixAutoUpdate = false;
    }
    texture.needsUpdate = true;
    return texture;
  }
};
var GLTFMeshQuantizationExtension = class {
  constructor() {
    this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
  }
};
var GLTFCubicSplineInterpolant = class extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  copySampleValue_(index) {
    const result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
    for (let i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i];
    }
    return result;
  }
  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const stride2 = stride * 2;
    const stride3 = stride * 3;
    const td = t1 - t0;
    const p = (t - t0) / td;
    const pp = p * p;
    const ppp = pp * p;
    const offset1 = i1 * stride3;
    const offset0 = offset1 - stride3;
    const s2 = -2 * ppp + 3 * pp;
    const s3 = ppp - pp;
    const s0 = 1 - s2;
    const s1 = s3 - pp + p;
    for (let i = 0; i !== stride; i++) {
      const p0 = values[offset0 + i + stride];
      const m0 = values[offset0 + i + stride2] * td;
      const p1 = values[offset1 + i + stride];
      const m1 = values[offset1 + i] * td;
      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
    }
    return result;
  }
};
var _quaternion = new Quaternion2();
var GLTFCubicSplineQuaternionInterpolant = class extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1);
    _quaternion.fromArray(result).normalize().toArray(result);
    return result;
  }
};
var WEBGL_CONSTANTS = {
  FLOAT: 5126,
  //FLOAT_MAT2: 35674,
  FLOAT_MAT3: 35675,
  FLOAT_MAT4: 35676,
  FLOAT_VEC2: 35664,
  FLOAT_VEC3: 35665,
  FLOAT_VEC4: 35666,
  LINEAR: 9729,
  REPEAT: 10497,
  SAMPLER_2D: 35678,
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
  UNSIGNED_BYTE: 5121,
  UNSIGNED_SHORT: 5123
};
var WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
};
var WEBGL_FILTERS = {
  9728: NearestFilter,
  9729: LinearFilter,
  9984: NearestMipmapNearestFilter,
  9985: LinearMipmapNearestFilter,
  9986: NearestMipmapLinearFilter,
  9987: LinearMipmapLinearFilter
};
var WEBGL_WRAPPINGS = {
  33071: ClampToEdgeWrapping,
  33648: MirroredRepeatWrapping,
  10497: RepeatWrapping
};
var WEBGL_TYPE_SIZES = {
  "SCALAR": 1,
  "VEC2": 2,
  "VEC3": 3,
  "VEC4": 4,
  "MAT2": 4,
  "MAT3": 9,
  "MAT4": 16
};
var ATTRIBUTES = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
};
var PATH_PROPERTIES = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
};
var INTERPOLATION = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: InterpolateLinear,
  STEP: InterpolateDiscrete
};
var ALPHA_MODES = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function createDefaultMaterial(cache) {
  if (cache["DefaultMaterial"] === void 0) {
    cache["DefaultMaterial"] = new MeshStandardMaterial({
      color: 16777215,
      emissive: 0,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide
    });
  }
  return cache["DefaultMaterial"];
}
function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
  for (const name in objectDef.extensions) {
    if (knownExtensions[name] === void 0) {
      object.userData.gltfExtensions = object.userData.gltfExtensions || {};
      object.userData.gltfExtensions[name] = objectDef.extensions[name];
    }
  }
}
function assignExtrasToUserData(object, gltfDef) {
  if (gltfDef.extras !== void 0) {
    if (typeof gltfDef.extras === "object") {
      Object.assign(object.userData, gltfDef.extras);
    } else {
      console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
    }
  }
}
function addMorphTargets(geometry, targets, parser) {
  let hasMorphPosition = false;
  let hasMorphNormal = false;
  let hasMorphColor = false;
  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i];
    if (target.POSITION !== void 0) hasMorphPosition = true;
    if (target.NORMAL !== void 0) hasMorphNormal = true;
    if (target.COLOR_0 !== void 0) hasMorphColor = true;
    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
  }
  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry);
  const pendingPositionAccessors = [];
  const pendingNormalAccessors = [];
  const pendingColorAccessors = [];
  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i];
    if (hasMorphPosition) {
      const pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry.attributes.position;
      pendingPositionAccessors.push(pendingAccessor);
    }
    if (hasMorphNormal) {
      const pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry.attributes.normal;
      pendingNormalAccessors.push(pendingAccessor);
    }
    if (hasMorphColor) {
      const pendingAccessor = target.COLOR_0 !== void 0 ? parser.getDependency("accessor", target.COLOR_0) : geometry.attributes.color;
      pendingColorAccessors.push(pendingAccessor);
    }
  }
  return Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors)
  ]).then(function(accessors) {
    const morphPositions = accessors[0];
    const morphNormals = accessors[1];
    const morphColors = accessors[2];
    if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
    if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
    if (hasMorphColor) geometry.morphAttributes.color = morphColors;
    geometry.morphTargetsRelative = true;
    return geometry;
  });
}
function updateMorphTargets(mesh, meshDef) {
  mesh.updateMorphTargets();
  if (meshDef.weights !== void 0) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences[i] = meshDef.weights[i];
    }
  }
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames;
    if (mesh.morphTargetInfluences.length === targetNames.length) {
      mesh.morphTargetDictionary = {};
      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i;
      }
    } else {
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
    }
  }
}
function createPrimitiveKey(primitiveDef) {
  let geometryKey;
  const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
  if (dracoExtension) {
    geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
  } else {
    geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
  }
  if (primitiveDef.targets !== void 0) {
    for (let i = 0, il = primitiveDef.targets.length; i < il; i++) {
      geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
    }
  }
  return geometryKey;
}
function createAttributesKey(attributes) {
  let attributesKey = "";
  const keys = Object.keys(attributes).sort();
  for (let i = 0, il = keys.length; i < il; i++) {
    attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
  }
  return attributesKey;
}
function getNormalizedComponentScale(constructor) {
  switch (constructor) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function getImageURIMimeType(uri) {
  if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data\:image\/jpeg/) === 0) return "image/jpeg";
  if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0) return "image/webp";
  if (uri.search(/\.ktx2($|\?)/i) > 0 || uri.search(/^data\:image\/ktx2/) === 0) return "image/ktx2";
  return "image/png";
}
var _identityMatrix = new Matrix42();
var GLTFParser = class {
  constructor(json = {}, options = {}) {
    this.json = json;
    this.extensions = {};
    this.plugins = {};
    this.options = options;
    this.cache = new GLTFRegistry();
    this.associations = /* @__PURE__ */ new Map();
    this.primitiveCache = {};
    this.nodeCache = {};
    this.meshCache = { refs: {}, uses: {} };
    this.cameraCache = { refs: {}, uses: {} };
    this.lightCache = { refs: {}, uses: {} };
    this.sourceCache = {};
    this.textureCache = {};
    this.nodeNamesUsed = {};
    let isSafari = false;
    let safariVersion = -1;
    let isFirefox = false;
    let firefoxVersion = -1;
    if (typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined") {
      const userAgent = navigator.userAgent;
      isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
      const safariMatch = userAgent.match(/Version\/(\d+)/);
      safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;
      isFirefox = userAgent.indexOf("Firefox") > -1;
      firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    if (typeof createImageBitmap === "undefined" || isSafari && safariVersion < 17 || isFirefox && firefoxVersion < 98) {
      this.textureLoader = new TextureLoader(this.options.manager);
    } else {
      this.textureLoader = new ImageBitmapLoader(this.options.manager);
    }
    this.textureLoader.setCrossOrigin(this.options.crossOrigin);
    this.textureLoader.setRequestHeader(this.options.requestHeader);
    this.fileLoader = new FileLoader(this.options.manager);
    this.fileLoader.setResponseType("arraybuffer");
    if (this.options.crossOrigin === "use-credentials") {
      this.fileLoader.setWithCredentials(true);
    }
  }
  setExtensions(extensions) {
    this.extensions = extensions;
  }
  setPlugins(plugins) {
    this.plugins = plugins;
  }
  parse(onLoad, onError) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    this.cache.removeAll();
    this.nodeCache = {};
    this._invokeAll(function(ext) {
      return ext._markDefs && ext._markDefs();
    });
    Promise.all(this._invokeAll(function(ext) {
      return ext.beforeRoot && ext.beforeRoot();
    })).then(function() {
      return Promise.all([
        parser.getDependencies("scene"),
        parser.getDependencies("animation"),
        parser.getDependencies("camera")
      ]);
    }).then(function(dependencies) {
      const result = {
        scene: dependencies[0][json.scene || 0],
        scenes: dependencies[0],
        animations: dependencies[1],
        cameras: dependencies[2],
        asset: json.asset,
        parser,
        userData: {}
      };
      addUnknownExtensionsToUserData(extensions, result, json);
      assignExtrasToUserData(result, json);
      return Promise.all(parser._invokeAll(function(ext) {
        return ext.afterRoot && ext.afterRoot(result);
      })).then(function() {
        for (const scene of result.scenes) {
          scene.updateMatrixWorld();
        }
        onLoad(result);
      });
    }).catch(onError);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   *
   * @private
   */
  _markDefs() {
    const nodeDefs = this.json.nodes || [];
    const skinDefs = this.json.skins || [];
    const meshDefs = this.json.meshes || [];
    for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
      const joints = skinDefs[skinIndex].joints;
      for (let i = 0, il = joints.length; i < il; i++) {
        nodeDefs[joints[i]].isBone = true;
      }
    }
    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.mesh !== void 0) {
        this._addNodeRef(this.meshCache, nodeDef.mesh);
        if (nodeDef.skin !== void 0) {
          meshDefs[nodeDef.mesh].isSkinnedMesh = true;
        }
      }
      if (nodeDef.camera !== void 0) {
        this._addNodeRef(this.cameraCache, nodeDef.camera);
      }
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   *
   * @private
   * @param {Object} cache
   * @param {Object3D} index
   */
  _addNodeRef(cache, index) {
    if (index === void 0) return;
    if (cache.refs[index] === void 0) {
      cache.refs[index] = cache.uses[index] = 0;
    }
    cache.refs[index]++;
  }
  /**
   * Returns a reference to a shared resource, cloning it if necessary.
   *
   * @private
   * @param {Object} cache
   * @param {number} index
   * @param {Object} object
   * @return {Object}
   */
  _getNodeRef(cache, index, object) {
    if (cache.refs[index] <= 1) return object;
    const ref = object.clone();
    const updateMappings = (original, clone2) => {
      const mappings = this.associations.get(original);
      if (mappings != null) {
        this.associations.set(clone2, mappings);
      }
      for (const [i, child] of original.children.entries()) {
        updateMappings(child, clone2.children[i]);
      }
    };
    updateMappings(object, ref);
    ref.name += "_instance_" + cache.uses[index]++;
    return ref;
  }
  _invokeOne(func) {
    const extensions = Object.values(this.plugins);
    extensions.push(this);
    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i]);
      if (result) return result;
    }
    return null;
  }
  _invokeAll(func) {
    const extensions = Object.values(this.plugins);
    extensions.unshift(this);
    const pending = [];
    for (let i = 0; i < extensions.length; i++) {
      const result = func(extensions[i]);
      if (result) pending.push(result);
    }
    return pending;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   *
   * @private
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(type, index) {
    const cacheKey = type + ":" + index;
    let dependency = this.cache.get(cacheKey);
    if (!dependency) {
      switch (type) {
        case "scene":
          dependency = this.loadScene(index);
          break;
        case "node":
          dependency = this._invokeOne(function(ext) {
            return ext.loadNode && ext.loadNode(index);
          });
          break;
        case "mesh":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMesh && ext.loadMesh(index);
          });
          break;
        case "accessor":
          dependency = this.loadAccessor(index);
          break;
        case "bufferView":
          dependency = this._invokeOne(function(ext) {
            return ext.loadBufferView && ext.loadBufferView(index);
          });
          break;
        case "buffer":
          dependency = this.loadBuffer(index);
          break;
        case "material":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMaterial && ext.loadMaterial(index);
          });
          break;
        case "texture":
          dependency = this._invokeOne(function(ext) {
            return ext.loadTexture && ext.loadTexture(index);
          });
          break;
        case "skin":
          dependency = this.loadSkin(index);
          break;
        case "animation":
          dependency = this._invokeOne(function(ext) {
            return ext.loadAnimation && ext.loadAnimation(index);
          });
          break;
        case "camera":
          dependency = this.loadCamera(index);
          break;
        default:
          dependency = this._invokeOne(function(ext) {
            return ext != this && ext.getDependency && ext.getDependency(type, index);
          });
          if (!dependency) {
            throw new Error("Unknown type: " + type);
          }
          break;
      }
      this.cache.add(cacheKey, dependency);
    }
    return dependency;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   *
   * @private
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(type) {
    let dependencies = this.cache.get(type);
    if (!dependencies) {
      const parser = this;
      const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
      dependencies = Promise.all(defs.map(function(def, index) {
        return parser.getDependency(type, index);
      }));
      this.cache.add(type, dependencies);
    }
    return dependencies;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   *
   * @private
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(bufferIndex) {
    const bufferDef = this.json.buffers[bufferIndex];
    const loader = this.fileLoader;
    if (bufferDef.type && bufferDef.type !== "arraybuffer") {
      throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
    }
    if (bufferDef.uri === void 0 && bufferIndex === 0) {
      return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
    }
    const options = this.options;
    return new Promise(function(resolve, reject) {
      loader.load(LoaderUtils.resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
        reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   *
   * @private
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(bufferViewIndex) {
    const bufferViewDef = this.json.bufferViews[bufferViewIndex];
    return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
      const byteLength = bufferViewDef.byteLength || 0;
      const byteOffset = bufferViewDef.byteOffset || 0;
      return buffer.slice(byteOffset, byteOffset + byteLength);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   *
   * @private
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(accessorIndex) {
    const parser = this;
    const json = this.json;
    const accessorDef = this.json.accessors[accessorIndex];
    if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
      const normalized = accessorDef.normalized === true;
      const array = new TypedArray(accessorDef.count * itemSize);
      return Promise.resolve(new BufferAttribute2(array, itemSize, normalized));
    }
    const pendingBufferViews = [];
    if (accessorDef.bufferView !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
    } else {
      pendingBufferViews.push(null);
    }
    if (accessorDef.sparse !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
    }
    return Promise.all(pendingBufferViews).then(function(bufferViews) {
      const bufferView = bufferViews[0];
      const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
      const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
      const elementBytes = TypedArray.BYTES_PER_ELEMENT;
      const itemBytes = elementBytes * itemSize;
      const byteOffset = accessorDef.byteOffset || 0;
      const byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
      const normalized = accessorDef.normalized === true;
      let array, bufferAttribute;
      if (byteStride && byteStride !== itemBytes) {
        const ibSlice = Math.floor(byteOffset / byteStride);
        const ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
        let ib = parser.cache.get(ibCacheKey);
        if (!ib) {
          array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
          ib = new InterleavedBuffer2(array, byteStride / elementBytes);
          parser.cache.add(ibCacheKey, ib);
        }
        bufferAttribute = new InterleavedBufferAttribute2(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
      } else {
        if (bufferView === null) {
          array = new TypedArray(accessorDef.count * itemSize);
        } else {
          array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
        }
        bufferAttribute = new BufferAttribute2(array, itemSize, normalized);
      }
      if (accessorDef.sparse !== void 0) {
        const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
        const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
        const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
        const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
        const sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
        const sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
        if (bufferView !== null) {
          bufferAttribute = new BufferAttribute2(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
        }
        bufferAttribute.normalized = false;
        for (let i = 0, il = sparseIndices.length; i < il; i++) {
          const index = sparseIndices[i];
          bufferAttribute.setX(index, sparseValues[i * itemSize]);
          if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
          if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
          if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
          if (itemSize >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        bufferAttribute.normalized = normalized;
      }
      return bufferAttribute;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   *
   * @private
   * @param {number} textureIndex
   * @return {Promise<?Texture>}
   */
  loadTexture(textureIndex) {
    const json = this.json;
    const options = this.options;
    const textureDef = json.textures[textureIndex];
    const sourceIndex = textureDef.source;
    const sourceDef = json.images[sourceIndex];
    let loader = this.textureLoader;
    if (sourceDef.uri) {
      const handler = options.manager.getHandler(sourceDef.uri);
      if (handler !== null) loader = handler;
    }
    return this.loadTextureImage(textureIndex, sourceIndex, loader);
  }
  loadTextureImage(textureIndex, sourceIndex, loader) {
    const parser = this;
    const json = this.json;
    const textureDef = json.textures[textureIndex];
    const sourceDef = json.images[sourceIndex];
    const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;
    if (this.textureCache[cacheKey]) {
      return this.textureCache[cacheKey];
    }
    const promise = this.loadImageSource(sourceIndex, loader).then(function(texture) {
      texture.flipY = false;
      texture.name = textureDef.name || sourceDef.name || "";
      if (texture.name === "" && typeof sourceDef.uri === "string" && sourceDef.uri.startsWith("data:image/") === false) {
        texture.name = sourceDef.uri;
      }
      const samplers = json.samplers || {};
      const sampler = samplers[textureDef.sampler] || {};
      texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
      texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
      texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
      texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;
      texture.generateMipmaps = !texture.isCompressedTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
      parser.associations.set(texture, { textures: textureIndex });
      return texture;
    }).catch(function() {
      return null;
    });
    this.textureCache[cacheKey] = promise;
    return promise;
  }
  loadImageSource(sourceIndex, loader) {
    const parser = this;
    const json = this.json;
    const options = this.options;
    if (this.sourceCache[sourceIndex] !== void 0) {
      return this.sourceCache[sourceIndex].then((texture) => texture.clone());
    }
    const sourceDef = json.images[sourceIndex];
    const URL2 = self.URL || self.webkitURL;
    let sourceURI = sourceDef.uri || "";
    let isObjectURL = false;
    if (sourceDef.bufferView !== void 0) {
      sourceURI = parser.getDependency("bufferView", sourceDef.bufferView).then(function(bufferView) {
        isObjectURL = true;
        const blob = new Blob([bufferView], { type: sourceDef.mimeType });
        sourceURI = URL2.createObjectURL(blob);
        return sourceURI;
      });
    } else if (sourceDef.uri === void 0) {
      throw new Error("THREE.GLTFLoader: Image " + sourceIndex + " is missing URI and bufferView");
    }
    const promise = Promise.resolve(sourceURI).then(function(sourceURI2) {
      return new Promise(function(resolve, reject) {
        let onLoad = resolve;
        if (loader.isImageBitmapLoader === true) {
          onLoad = function(imageBitmap) {
            const texture = new Texture(imageBitmap);
            texture.needsUpdate = true;
            resolve(texture);
          };
        }
        loader.load(LoaderUtils.resolveURL(sourceURI2, options.path), onLoad, void 0, reject);
      });
    }).then(function(texture) {
      if (isObjectURL === true) {
        URL2.revokeObjectURL(sourceURI);
      }
      assignExtrasToUserData(texture, sourceDef);
      texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);
      return texture;
    }).catch(function(error) {
      console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
      throw error;
    });
    this.sourceCache[sourceIndex] = promise;
    return promise;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   *
   * @private
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @param {string} [colorSpace]
   * @return {Promise<Texture>}
   */
  assignTexture(materialParams, mapName, mapDef, colorSpace) {
    const parser = this;
    return this.getDependency("texture", mapDef.index).then(function(texture) {
      if (!texture) return null;
      if (mapDef.texCoord !== void 0 && mapDef.texCoord > 0) {
        texture = texture.clone();
        texture.channel = mapDef.texCoord;
      }
      if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
        const transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
        if (transform) {
          const gltfReference = parser.associations.get(texture);
          texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
          parser.associations.set(texture, gltfReference);
        }
      }
      if (colorSpace !== void 0) {
        texture.colorSpace = colorSpace;
      }
      materialParams[mapName] = texture;
      return texture;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   *
   * @private
   * @param {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(mesh) {
    const geometry = mesh.geometry;
    let material = mesh.material;
    const useDerivativeTangents = geometry.attributes.tangent === void 0;
    const useVertexColors = geometry.attributes.color !== void 0;
    const useFlatShading = geometry.attributes.normal === void 0;
    if (mesh.isPoints) {
      const cacheKey = "PointsMaterial:" + material.uuid;
      let pointsMaterial = this.cache.get(cacheKey);
      if (!pointsMaterial) {
        pointsMaterial = new PointsMaterial();
        Material.prototype.copy.call(pointsMaterial, material);
        pointsMaterial.color.copy(material.color);
        pointsMaterial.map = material.map;
        pointsMaterial.sizeAttenuation = false;
        this.cache.add(cacheKey, pointsMaterial);
      }
      material = pointsMaterial;
    } else if (mesh.isLine) {
      const cacheKey = "LineBasicMaterial:" + material.uuid;
      let lineMaterial = this.cache.get(cacheKey);
      if (!lineMaterial) {
        lineMaterial = new LineBasicMaterial();
        Material.prototype.copy.call(lineMaterial, material);
        lineMaterial.color.copy(material.color);
        lineMaterial.map = material.map;
        this.cache.add(cacheKey, lineMaterial);
      }
      material = lineMaterial;
    }
    if (useDerivativeTangents || useVertexColors || useFlatShading) {
      let cacheKey = "ClonedMaterial:" + material.uuid + ":";
      if (useDerivativeTangents) cacheKey += "derivative-tangents:";
      if (useVertexColors) cacheKey += "vertex-colors:";
      if (useFlatShading) cacheKey += "flat-shading:";
      let cachedMaterial = this.cache.get(cacheKey);
      if (!cachedMaterial) {
        cachedMaterial = material.clone();
        if (useVertexColors) cachedMaterial.vertexColors = true;
        if (useFlatShading) cachedMaterial.flatShading = true;
        if (useDerivativeTangents) {
          if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
          if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= -1;
        }
        this.cache.add(cacheKey, cachedMaterial);
        this.associations.set(cachedMaterial, this.associations.get(material));
      }
      material = cachedMaterial;
    }
    mesh.material = material;
  }
  getMaterialType() {
    return MeshStandardMaterial;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   *
   * @private
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(materialIndex) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    const materialDef = json.materials[materialIndex];
    let materialType;
    const materialParams = {};
    const materialExtensions = materialDef.extensions || {};
    const pending = [];
    if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
      const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
      materialType = kmuExtension.getMaterialType();
      pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
    } else {
      const metallicRoughness = materialDef.pbrMetallicRoughness || {};
      materialParams.color = new Color(1, 1, 1);
      materialParams.opacity = 1;
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor;
        materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
      }
      materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
      materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
      if (metallicRoughness.metallicRoughnessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
        pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
      }
      materialType = this._invokeOne(function(ext) {
        return ext.getMaterialType && ext.getMaterialType(materialIndex);
      });
      pending.push(Promise.all(this._invokeAll(function(ext) {
        return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
      })));
    }
    if (materialDef.doubleSided === true) {
      materialParams.side = DoubleSide;
    }
    const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
    if (alphaMode === ALPHA_MODES.BLEND) {
      materialParams.transparent = true;
      materialParams.depthWrite = false;
    } else {
      materialParams.transparent = false;
      if (alphaMode === ALPHA_MODES.MASK) {
        materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : 0.5;
      }
    }
    if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
      materialParams.normalScale = new Vector2(1, 1);
      if (materialDef.normalTexture.scale !== void 0) {
        const scale = materialDef.normalTexture.scale;
        materialParams.normalScale.set(scale, scale);
      }
    }
    if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
      if (materialDef.occlusionTexture.strength !== void 0) {
        materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
      }
    }
    if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
      const emissiveFactor = materialDef.emissiveFactor;
      materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);
    }
    if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) {
      pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture, SRGBColorSpace));
    }
    return Promise.all(pending).then(function() {
      const material = new materialType(materialParams);
      if (materialDef.name) material.name = materialDef.name;
      assignExtrasToUserData(material, materialDef);
      parser.associations.set(material, { materials: materialIndex });
      if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
      return material;
    });
  }
  /**
   * When Object3D instances are targeted by animation, they need unique names.
   *
   * @private
   * @param {string} originalName
   * @return {string}
   */
  createUniqueName(originalName) {
    const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || "");
    if (sanitizedName in this.nodeNamesUsed) {
      return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
    } else {
      this.nodeNamesUsed[sanitizedName] = 0;
      return sanitizedName;
    }
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @private
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(primitives) {
    const parser = this;
    const extensions = this.extensions;
    const cache = this.primitiveCache;
    function createDracoPrimitive(primitive) {
      return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function(geometry) {
        return addPrimitiveAttributes(geometry, primitive, parser);
      });
    }
    const pending = [];
    for (let i = 0, il = primitives.length; i < il; i++) {
      const primitive = primitives[i];
      const cacheKey = createPrimitiveKey(primitive);
      const cached = cache[cacheKey];
      if (cached) {
        pending.push(cached.promise);
      } else {
        let geometryPromise;
        if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
          geometryPromise = createDracoPrimitive(primitive);
        } else {
          geometryPromise = addPrimitiveAttributes(new BufferGeometry2(), primitive, parser);
        }
        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
          geometryPromise = geometryPromise.then((geometry) => toTrianglesDrawMode(geometry, TriangleStripDrawMode2));
        } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
          geometryPromise = geometryPromise.then((geometry) => toTrianglesDrawMode(geometry, TriangleFanDrawMode2));
        }
        cache[cacheKey] = { primitive, promise: geometryPromise };
        pending.push(geometryPromise);
      }
    }
    return Promise.all(pending);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   *
   * @private
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh|Line|Points>}
   */
  loadMesh(meshIndex) {
    const parser = this;
    const json = this.json;
    const extensions = this.extensions;
    const meshDef = json.meshes[meshIndex];
    const primitives = meshDef.primitives;
    const pending = [];
    for (let i = 0, il = primitives.length; i < il; i++) {
      const material = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
      pending.push(material);
    }
    pending.push(parser.loadGeometries(primitives));
    return Promise.all(pending).then(async function(results) {
      const materials = results.slice(0, results.length - 1);
      const geometries = results[results.length - 1];
      const meshes = [];
      for (let i = 0, il = geometries.length; i < il; i++) {
        const geometry = geometries[i];
        const primitive = primitives[i];
        let mesh;
        const material = materials[i];
        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
          const needsSkinning = meshDef.isSkinnedMesh === true;
          const hasSkinningAttributes = geometry.hasAttribute("skinIndex") && geometry.hasAttribute("skinWeight");
          if (needsSkinning && hasSkinningAttributes === false) {
            console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled.");
          }
          mesh = needsSkinning && hasSkinningAttributes ? new SkinnedMesh(geometry, material) : new Mesh(geometry, material);
          if (mesh.isSkinnedMesh === true) {
            mesh.normalizeSkinWeights();
          }
        } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
          mesh = new LineSegments(geometry, material);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
          mesh = new Line(geometry, material);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
          mesh = new LineLoop(geometry, material);
        } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
          mesh = new Points(geometry, material);
        } else {
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
        }
        if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
          updateMorphTargets(mesh, meshDef);
        }
        mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
        assignExtrasToUserData(mesh, meshDef);
        if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);
        parser.assignFinalMaterial(mesh);
        meshes.push(mesh);
      }
      for (let i = 0, il = meshes.length; i < il; i++) {
        parser.associations.set(meshes[i], {
          meshes: meshIndex,
          primitives: i
        });
      }
      if (meshes.length === 1) {
        if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);
        return meshes[0];
      }
      const group = new Group();
      if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);
      parser.associations.set(group, { meshes: meshIndex });
      for (let i = 0, il = meshes.length; i < il; i++) {
        group.add(meshes[i]);
      }
      return group;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   *
   * @private
   * @param {number} cameraIndex
   * @return {Promise<Camera>|undefined}
   */
  loadCamera(cameraIndex) {
    let camera;
    const cameraDef = this.json.cameras[cameraIndex];
    const params = cameraDef[cameraDef.type];
    if (!params) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    if (cameraDef.type === "perspective") {
      camera = new PerspectiveCamera(MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
    } else if (cameraDef.type === "orthographic") {
      camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar);
    }
    if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);
    assignExtrasToUserData(camera, cameraDef);
    return Promise.resolve(camera);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   *
   * @private
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(skinIndex) {
    const skinDef = this.json.skins[skinIndex];
    const pending = [];
    for (let i = 0, il = skinDef.joints.length; i < il; i++) {
      pending.push(this._loadNodeShallow(skinDef.joints[i]));
    }
    if (skinDef.inverseBindMatrices !== void 0) {
      pending.push(this.getDependency("accessor", skinDef.inverseBindMatrices));
    } else {
      pending.push(null);
    }
    return Promise.all(pending).then(function(results) {
      const inverseBindMatrices = results.pop();
      const jointNodes = results;
      const bones = [];
      const boneInverses = [];
      for (let i = 0, il = jointNodes.length; i < il; i++) {
        const jointNode = jointNodes[i];
        if (jointNode) {
          bones.push(jointNode);
          const mat = new Matrix42();
          if (inverseBindMatrices !== null) {
            mat.fromArray(inverseBindMatrices.array, i * 16);
          }
          boneInverses.push(mat);
        } else {
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinDef.joints[i]);
        }
      }
      return new Skeleton(bones, boneInverses);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   *
   * @private
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(animationIndex) {
    const json = this.json;
    const parser = this;
    const animationDef = json.animations[animationIndex];
    const animationName = animationDef.name ? animationDef.name : "animation_" + animationIndex;
    const pendingNodes = [];
    const pendingInputAccessors = [];
    const pendingOutputAccessors = [];
    const pendingSamplers = [];
    const pendingTargets = [];
    for (let i = 0, il = animationDef.channels.length; i < il; i++) {
      const channel = animationDef.channels[i];
      const sampler = animationDef.samplers[channel.sampler];
      const target = channel.target;
      const name = target.node;
      const input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
      const output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
      if (target.node === void 0) continue;
      pendingNodes.push(this.getDependency("node", name));
      pendingInputAccessors.push(this.getDependency("accessor", input));
      pendingOutputAccessors.push(this.getDependency("accessor", output));
      pendingSamplers.push(sampler);
      pendingTargets.push(target);
    }
    return Promise.all([
      Promise.all(pendingNodes),
      Promise.all(pendingInputAccessors),
      Promise.all(pendingOutputAccessors),
      Promise.all(pendingSamplers),
      Promise.all(pendingTargets)
    ]).then(function(dependencies) {
      const nodes = dependencies[0];
      const inputAccessors = dependencies[1];
      const outputAccessors = dependencies[2];
      const samplers = dependencies[3];
      const targets = dependencies[4];
      const tracks = [];
      for (let i = 0, il = nodes.length; i < il; i++) {
        const node = nodes[i];
        const inputAccessor = inputAccessors[i];
        const outputAccessor = outputAccessors[i];
        const sampler = samplers[i];
        const target = targets[i];
        if (node === void 0) continue;
        if (node.updateMatrix) {
          node.updateMatrix();
        }
        const createdTracks = parser._createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target);
        if (createdTracks) {
          for (let k = 0; k < createdTracks.length; k++) {
            tracks.push(createdTracks[k]);
          }
        }
      }
      const animation = new AnimationClip2(animationName, void 0, tracks);
      assignExtrasToUserData(animation, animationDef);
      return animation;
    });
  }
  createNodeMesh(nodeIndex) {
    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];
    if (nodeDef.mesh === void 0) return null;
    return parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
      const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
      if (nodeDef.weights !== void 0) {
        node.traverse(function(o) {
          if (!o.isMesh) return;
          for (let i = 0, il = nodeDef.weights.length; i < il; i++) {
            o.morphTargetInfluences[i] = nodeDef.weights[i];
          }
        });
      }
      return node;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   *
   * @private
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(nodeIndex) {
    const json = this.json;
    const parser = this;
    const nodeDef = json.nodes[nodeIndex];
    const nodePending = parser._loadNodeShallow(nodeIndex);
    const childPending = [];
    const childrenDef = nodeDef.children || [];
    for (let i = 0, il = childrenDef.length; i < il; i++) {
      childPending.push(parser.getDependency("node", childrenDef[i]));
    }
    const skeletonPending = nodeDef.skin === void 0 ? Promise.resolve(null) : parser.getDependency("skin", nodeDef.skin);
    return Promise.all([
      nodePending,
      Promise.all(childPending),
      skeletonPending
    ]).then(function(results) {
      const node = results[0];
      const children = results[1];
      const skeleton = results[2];
      if (skeleton !== null) {
        node.traverse(function(mesh) {
          if (!mesh.isSkinnedMesh) return;
          mesh.bind(skeleton, _identityMatrix);
        });
      }
      for (let i = 0, il = children.length; i < il; i++) {
        node.add(children[i]);
      }
      if (node.userData.pivot !== void 0 && children.length > 0) {
        const pivot = node.userData.pivot;
        const pivotChild = children[0];
        node.pivot = new Vector33().fromArray(pivot);
        node.position.x -= pivot[0];
        node.position.y -= pivot[1];
        node.position.z -= pivot[2];
        pivotChild.position.set(0, 0, 0);
        delete node.userData.pivot;
      }
      return node;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(nodeIndex) {
    const json = this.json;
    const extensions = this.extensions;
    const parser = this;
    if (this.nodeCache[nodeIndex] !== void 0) {
      return this.nodeCache[nodeIndex];
    }
    const nodeDef = json.nodes[nodeIndex];
    const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
    const pending = [];
    const meshPromise = parser._invokeOne(function(ext) {
      return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
    });
    if (meshPromise) {
      pending.push(meshPromise);
    }
    if (nodeDef.camera !== void 0) {
      pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera) {
        return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);
      }));
    }
    parser._invokeAll(function(ext) {
      return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
    }).forEach(function(promise) {
      pending.push(promise);
    });
    this.nodeCache[nodeIndex] = Promise.all(pending).then(function(objects) {
      let node;
      if (nodeDef.isBone === true) {
        node = new Bone();
      } else if (objects.length > 1) {
        node = new Group();
      } else if (objects.length === 1) {
        node = objects[0];
      } else {
        node = new Object3D();
      }
      if (node !== objects[0]) {
        for (let i = 0, il = objects.length; i < il; i++) {
          node.add(objects[i]);
        }
      }
      if (nodeDef.name) {
        node.userData.name = nodeDef.name;
        node.name = nodeName;
      }
      assignExtrasToUserData(node, nodeDef);
      if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);
      if (nodeDef.matrix !== void 0) {
        const matrix = new Matrix42();
        matrix.fromArray(nodeDef.matrix);
        node.applyMatrix4(matrix);
      } else {
        if (nodeDef.translation !== void 0) {
          node.position.fromArray(nodeDef.translation);
        }
        if (nodeDef.rotation !== void 0) {
          node.quaternion.fromArray(nodeDef.rotation);
        }
        if (nodeDef.scale !== void 0) {
          node.scale.fromArray(nodeDef.scale);
        }
      }
      if (!parser.associations.has(node)) {
        parser.associations.set(node, {});
      } else if (nodeDef.mesh !== void 0 && parser.meshCache.refs[nodeDef.mesh] > 1) {
        const mapping = parser.associations.get(node);
        parser.associations.set(node, { ...mapping });
      }
      parser.associations.get(node).nodes = nodeIndex;
      return node;
    });
    return this.nodeCache[nodeIndex];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   *
   * @private
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(sceneIndex) {
    const extensions = this.extensions;
    const sceneDef = this.json.scenes[sceneIndex];
    const parser = this;
    const scene = new Group();
    if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);
    assignExtrasToUserData(scene, sceneDef);
    if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);
    const nodeIds = sceneDef.nodes || [];
    const pending = [];
    for (let i = 0, il = nodeIds.length; i < il; i++) {
      pending.push(parser.getDependency("node", nodeIds[i]));
    }
    return Promise.all(pending).then(function(nodes) {
      for (let i = 0, il = nodes.length; i < il; i++) {
        const node = nodes[i];
        if (node.parent !== null) {
          scene.add(clone(node));
        } else {
          scene.add(node);
        }
      }
      const reduceAssociations = (node) => {
        const reducedAssociations = /* @__PURE__ */ new Map();
        for (const [key, value] of parser.associations) {
          if (key instanceof Material || key instanceof Texture) {
            reducedAssociations.set(key, value);
          }
        }
        node.traverse((node2) => {
          const mappings = parser.associations.get(node2);
          if (mappings != null) {
            reducedAssociations.set(node2, mappings);
          }
        });
        return reducedAssociations;
      };
      parser.associations = reduceAssociations(scene);
      return scene;
    });
  }
  _createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target) {
    const tracks = [];
    const targetName = node.name ? node.name : node.uuid;
    const targetNames = [];
    function collectMorphTargets(object) {
      if (object.morphTargetInfluences) {
        targetNames.push(object.name ? object.name : object.uuid);
      }
    }
    if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
      collectMorphTargets(node);
      if (node.isGroup) {
        node.children.forEach(collectMorphTargets);
      }
    } else {
      targetNames.push(targetName);
    }
    let TypedKeyframeTrack;
    switch (PATH_PROPERTIES[target.path]) {
      case PATH_PROPERTIES.weights:
        TypedKeyframeTrack = NumberKeyframeTrack;
        break;
      case PATH_PROPERTIES.rotation:
        TypedKeyframeTrack = QuaternionKeyframeTrack2;
        break;
      case PATH_PROPERTIES.translation:
      case PATH_PROPERTIES.scale:
        TypedKeyframeTrack = VectorKeyframeTrack2;
        break;
      default:
        switch (outputAccessor.itemSize) {
          case 1:
            TypedKeyframeTrack = NumberKeyframeTrack;
            break;
          case 2:
          case 3:
          default:
            TypedKeyframeTrack = VectorKeyframeTrack2;
            break;
        }
        break;
    }
    const interpolation = sampler.interpolation !== void 0 ? INTERPOLATION[sampler.interpolation] : InterpolateLinear;
    const outputArray = this._getArrayFromAccessor(outputAccessor);
    for (let j = 0, jl = targetNames.length; j < jl; j++) {
      const track = new TypedKeyframeTrack(
        targetNames[j] + "." + PATH_PROPERTIES[target.path],
        inputAccessor.array,
        outputArray,
        interpolation
      );
      if (sampler.interpolation === "CUBICSPLINE") {
        this._createCubicSplineTrackInterpolant(track);
      }
      tracks.push(track);
    }
    return tracks;
  }
  _getArrayFromAccessor(accessor) {
    let outputArray = accessor.array;
    if (accessor.normalized) {
      const scale = getNormalizedComponentScale(outputArray.constructor);
      const scaled = new Float32Array(outputArray.length);
      for (let j = 0, jl = outputArray.length; j < jl; j++) {
        scaled[j] = outputArray[j] * scale;
      }
      outputArray = scaled;
    }
    return outputArray;
  }
  _createCubicSplineTrackInterpolant(track) {
    track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
      const interpolantType = this instanceof QuaternionKeyframeTrack2 ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant;
      return new interpolantType(this.times, this.values, this.getValueSize() / 3, result);
    };
    track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
  }
};
function computeBounds(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes;
  const box = new Box3();
  if (attributes.POSITION !== void 0) {
    const accessor = parser.json.accessors[attributes.POSITION];
    const min = accessor.min;
    const max = accessor.max;
    if (min !== void 0 && max !== void 0) {
      box.set(
        new Vector33(min[0], min[1], min[2]),
        new Vector33(max[0], max[1], max[2])
      );
      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
        box.min.multiplyScalar(boxScale);
        box.max.multiplyScalar(boxScale);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else {
    return;
  }
  const targets = primitiveDef.targets;
  if (targets !== void 0) {
    const maxDisplacement = new Vector33();
    const vector = new Vector33();
    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];
      if (target.POSITION !== void 0) {
        const accessor = parser.json.accessors[target.POSITION];
        const min = accessor.min;
        const max = accessor.max;
        if (min !== void 0 && max !== void 0) {
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
            vector.multiplyScalar(boxScale);
          }
          maxDisplacement.max(vector);
        } else {
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
        }
      }
    }
    box.expandByVector(maxDisplacement);
  }
  geometry.boundingBox = box;
  const sphere = new Sphere();
  box.getCenter(sphere.center);
  sphere.radius = box.min.distanceTo(box.max) / 2;
  geometry.boundingSphere = sphere;
}
function addPrimitiveAttributes(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes;
  const pending = [];
  function assignAttributeAccessor(accessorIndex, attributeName) {
    return parser.getDependency("accessor", accessorIndex).then(function(accessor) {
      geometry.setAttribute(attributeName, accessor);
    });
  }
  for (const gltfAttributeName in attributes) {
    const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
    if (threeAttributeName in geometry.attributes) continue;
    pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
  }
  if (primitiveDef.indices !== void 0 && !geometry.index) {
    const accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor2) {
      geometry.setIndex(accessor2);
    });
    pending.push(accessor);
  }
  if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && "COLOR_0" in attributes) {
    console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);
  }
  assignExtrasToUserData(geometry, primitiveDef);
  computeBounds(geometry, primitiveDef, parser);
  return Promise.all(pending).then(function() {
    return primitiveDef.targets !== void 0 ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
  });
}

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/controls/OrbitControls.js
import {
  Controls,
  MOUSE,
  Quaternion as Quaternion3,
  Spherical,
  TOUCH,
  Vector2 as Vector22,
  Vector3 as Vector34,
  Plane,
  Ray,
  MathUtils as MathUtils2
} from "../vendor/three/three.module.js";
var _changeEvent = { type: "change" };
var _startEvent = { type: "start" };
var _endEvent = { type: "end" };
var _ray = new Ray();
var _plane = new Plane();
var _TILT_LIMIT = Math.cos(70 * MathUtils2.DEG2RAD);
var _v = new Vector34();
var _twoPI = 2 * Math.PI;
var _STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
};
var _EPS = 1e-6;
var OrbitControls = class extends Controls {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLElement} domElement - The HTML element used for event listeners.
   */
  constructor(object, domElement = null) {
    super(object, domElement);
    this.state = _STATE.NONE;
    this.target = new Vector34();
    this.cursor = new Vector34();
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minZoom = 0;
    this.maxZoom = Infinity;
    this.minTargetRadius = 0;
    this.maxTargetRadius = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1;
    this.enableRotate = true;
    this.rotateSpeed = 1;
    this.keyRotateSpeed = 1;
    this.enablePan = true;
    this.panSpeed = 1;
    this.screenSpacePanning = true;
    this.keyPanSpeed = 7;
    this.zoomToCursor = false;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" };
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    this._cursorStyle = "auto";
    this._domElementKeyEvents = null;
    this._lastPosition = new Vector34();
    this._lastQuaternion = new Quaternion3();
    this._lastTargetPosition = new Vector34();
    this._quat = new Quaternion3().setFromUnitVectors(object.up, new Vector34(0, 1, 0));
    this._quatInverse = this._quat.clone().invert();
    this._spherical = new Spherical();
    this._sphericalDelta = new Spherical();
    this._scale = 1;
    this._panOffset = new Vector34();
    this._rotateStart = new Vector22();
    this._rotateEnd = new Vector22();
    this._rotateDelta = new Vector22();
    this._panStart = new Vector22();
    this._panEnd = new Vector22();
    this._panDelta = new Vector22();
    this._dollyStart = new Vector22();
    this._dollyEnd = new Vector22();
    this._dollyDelta = new Vector22();
    this._dollyDirection = new Vector34();
    this._mouse = new Vector22();
    this._performCursorZoom = false;
    this._pointers = [];
    this._pointerPositions = {};
    this._controlActive = false;
    this._onPointerMove = onPointerMove.bind(this);
    this._onPointerDown = onPointerDown.bind(this);
    this._onPointerUp = onPointerUp.bind(this);
    this._onContextMenu = onContextMenu.bind(this);
    this._onMouseWheel = onMouseWheel.bind(this);
    this._onKeyDown = onKeyDown.bind(this);
    this._onTouchStart = onTouchStart.bind(this);
    this._onTouchMove = onTouchMove.bind(this);
    this._onMouseDown = onMouseDown.bind(this);
    this._onMouseMove = onMouseMove.bind(this);
    this._interceptControlDown = interceptControlDown.bind(this);
    this._interceptControlUp = interceptControlUp.bind(this);
    if (this.domElement !== null) {
      this.connect(this.domElement);
    }
    this.update();
  }
  /**
   * Defines the visual representation of the cursor.
   *
   * @type {('auto'|'grab')}
   * @default 'auto'
   */
  set cursorStyle(type) {
    this._cursorStyle = type;
    if (type === "grab") {
      this.domElement.style.cursor = "grab";
    } else {
      this.domElement.style.cursor = "auto";
    }
  }
  get cursorStyle() {
    return this._cursorStyle;
  }
  connect(element) {
    super.connect(element);
    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointercancel", this._onPointerUp);
    this.domElement.addEventListener("contextmenu", this._onContextMenu);
    this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: false });
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keydown", this._interceptControlDown, { passive: true, capture: true });
    this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.state = _STATE.NONE;
    this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp);
    this.domElement.removeEventListener("pointercancel", this._onPointerUp);
    this.domElement.removeEventListener("wheel", this._onMouseWheel);
    this.domElement.removeEventListener("contextmenu", this._onContextMenu);
    this.stopListenToKeyEvents();
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keydown", this._interceptControlDown, { capture: true });
    document2.removeEventListener("keyup", this._interceptControlUp, { capture: true });
    this._controlActive = false;
    this._pointers.length = 0;
    this._pointerPositions = {};
    this.domElement.style.touchAction = "";
    this.domElement.style.cursor = "auto";
  }
  dispose() {
    this.disconnect();
  }
  /**
   * Get the current vertical rotation, in radians.
   *
   * @return {number} The current vertical rotation, in radians.
   */
  getPolarAngle() {
    return this._spherical.phi;
  }
  /**
   * Get the current horizontal rotation, in radians.
   *
   * @return {number} The current horizontal rotation, in radians.
   */
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  /**
   * Returns the distance from the camera to the target.
   *
   * @return {number} The distance from the camera to the target.
   */
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  /**
   * Adds key event listeners to the given DOM element.
   * `window` is a recommended argument for using this method.
   *
   * @param {HTMLElement} domElement - The DOM element
   */
  listenToKeyEvents(domElement) {
    domElement.addEventListener("keydown", this._onKeyDown);
    this._domElementKeyEvents = domElement;
  }
  /**
   * Removes the key event listener previously defined with `listenToKeyEvents()`.
   */
  stopListenToKeyEvents() {
    if (this._domElementKeyEvents !== null) {
      this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown);
      this._domElementKeyEvents = null;
    }
  }
  /**
   * Save the current state of the controls. This can later be recovered with `reset()`.
   */
  saveState() {
    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;
  }
  /**
   * Reset the controls to their state from either the last time the `saveState()`
   * was called, or the initial state.
   */
  reset() {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;
    this.object.updateProjectionMatrix();
    this.dispatchEvent(_changeEvent);
    this.update();
    this.state = _STATE.NONE;
  }
  /**
   * Programmatically pan the camera.
   *
   * @param {number} deltaX - The horizontal pan amount in pixels.
   * @param {number} deltaY - The vertical pan amount in pixels.
   */
  pan(deltaX, deltaY) {
    this._pan(deltaX, deltaY);
    this.update();
  }
  /**
   * Programmatically dolly in (zoom in for perspective camera).
   *
   * @param {number} dollyScale - The dolly scale factor.
   */
  dollyIn(dollyScale) {
    this._dollyIn(dollyScale);
    this.update();
  }
  /**
   * Programmatically dolly out (zoom out for perspective camera).
   *
   * @param {number} dollyScale - The dolly scale factor.
   */
  dollyOut(dollyScale) {
    this._dollyOut(dollyScale);
    this.update();
  }
  /**
   * Programmatically rotate the camera left (around the vertical axis).
   *
   * @param {number} angle - The rotation angle in radians.
   */
  rotateLeft(angle) {
    this._rotateLeft(angle);
    this.update();
  }
  /**
   * Programmatically rotate the camera up (around the horizontal axis).
   *
   * @param {number} angle - The rotation angle in radians.
   */
  rotateUp(angle) {
    this._rotateUp(angle);
    this.update();
  }
  update(deltaTime = null) {
    const position = this.object.position;
    _v.copy(position).sub(this.target);
    _v.applyQuaternion(this._quat);
    this._spherical.setFromVector3(_v);
    if (this.autoRotate && this.state === _STATE.NONE) {
      this._rotateLeft(this._getAutoRotationAngle(deltaTime));
    }
    if (this.enableDamping) {
      this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor;
      this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;
    } else {
      this._spherical.theta += this._sphericalDelta.theta;
      this._spherical.phi += this._sphericalDelta.phi;
    }
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;
    if (isFinite(min) && isFinite(max)) {
      if (min < -Math.PI) min += _twoPI;
      else if (min > Math.PI) min -= _twoPI;
      if (max < -Math.PI) max += _twoPI;
      else if (max > Math.PI) max -= _twoPI;
      if (min <= max) {
        this._spherical.theta = Math.max(min, Math.min(max, this._spherical.theta));
      } else {
        this._spherical.theta = this._spherical.theta > (min + max) / 2 ? Math.max(min, this._spherical.theta) : Math.min(max, this._spherical.theta);
      }
    }
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    if (this.enableDamping === true) {
      this.target.addScaledVector(this._panOffset, this.dampingFactor);
    } else {
      this.target.add(this._panOffset);
    }
    this.target.sub(this.cursor);
    this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
    this.target.add(this.cursor);
    let zoomChanged = false;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) {
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    } else {
      const prevRadius = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale);
      zoomChanged = prevRadius != this._spherical.radius;
    }
    _v.setFromSpherical(this._spherical);
    _v.applyQuaternion(this._quatInverse);
    position.copy(this.target).add(_v);
    this.object.lookAt(this.target);
    if (this.enableDamping === true) {
      this._sphericalDelta.theta *= 1 - this.dampingFactor;
      this._sphericalDelta.phi *= 1 - this.dampingFactor;
      this._panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this._sphericalDelta.set(0, 0, 0);
      this._panOffset.set(0, 0, 0);
    }
    if (this.zoomToCursor && this._performCursorZoom) {
      let newRadius = null;
      if (this.object.isPerspectiveCamera) {
        const prevRadius = _v.length();
        newRadius = this._clampDistance(prevRadius * this._scale);
        const radiusDelta = prevRadius - newRadius;
        this.object.position.addScaledVector(this._dollyDirection, radiusDelta);
        this.object.updateMatrixWorld();
        zoomChanged = !!radiusDelta;
      } else if (this.object.isOrthographicCamera) {
        const mouseBefore = new Vector34(this._mouse.x, this._mouse.y, 0);
        mouseBefore.unproject(this.object);
        const prevZoom = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
        this.object.updateProjectionMatrix();
        zoomChanged = prevZoom !== this.object.zoom;
        const mouseAfter = new Vector34(this._mouse.x, this._mouse.y, 0);
        mouseAfter.unproject(this.object);
        this.object.position.sub(mouseAfter).add(mouseBefore);
        this.object.updateMatrixWorld();
        newRadius = _v.length();
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.");
        this.zoomToCursor = false;
      }
      if (newRadius !== null) {
        if (this.screenSpacePanning) {
          this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(newRadius).add(this.object.position);
        } else {
          _ray.origin.copy(this.object.position);
          _ray.direction.set(0, 0, -1).transformDirection(this.object.matrix);
          if (Math.abs(this.object.up.dot(_ray.direction)) < _TILT_LIMIT) {
            this.object.lookAt(this.target);
          } else {
            _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
            _ray.intersectPlane(_plane, this.target);
          }
        }
      }
    } else if (this.object.isOrthographicCamera) {
      const prevZoom = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
      if (prevZoom !== this.object.zoom) {
        this.object.updateProjectionMatrix();
        zoomChanged = true;
      }
    }
    this._scale = 1;
    this._performCursorZoom = false;
    if (zoomChanged || this._lastPosition.distanceToSquared(this.object.position) > _EPS || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > _EPS || this._lastTargetPosition.distanceToSquared(this.target) > _EPS) {
      this.dispatchEvent(_changeEvent);
      this._lastPosition.copy(this.object.position);
      this._lastQuaternion.copy(this.object.quaternion);
      this._lastTargetPosition.copy(this.target);
      return true;
    }
    return false;
  }
  _getAutoRotationAngle(deltaTime) {
    if (deltaTime !== null) {
      return _twoPI / 60 * this.autoRotateSpeed * deltaTime;
    } else {
      return _twoPI / 60 / 60 * this.autoRotateSpeed;
    }
  }
  _getZoomScale(delta) {
    const normalizedDelta = Math.abs(delta * 0.01);
    return Math.pow(0.95, this.zoomSpeed * normalizedDelta);
  }
  _rotateLeft(angle) {
    this._sphericalDelta.theta -= angle;
  }
  _rotateUp(angle) {
    this._sphericalDelta.phi -= angle;
  }
  _panLeft(distance, objectMatrix) {
    _v.setFromMatrixColumn(objectMatrix, 0);
    _v.multiplyScalar(-distance);
    this._panOffset.add(_v);
  }
  _panUp(distance, objectMatrix) {
    if (this.screenSpacePanning === true) {
      _v.setFromMatrixColumn(objectMatrix, 1);
    } else {
      _v.setFromMatrixColumn(objectMatrix, 0);
      _v.crossVectors(this.object.up, _v);
    }
    _v.multiplyScalar(distance);
    this._panOffset.add(_v);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(deltaX, deltaY) {
    const element = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const position = this.object.position;
      _v.copy(position).sub(this.target);
      let targetDistance = _v.length();
      targetDistance *= Math.tan(this.object.fov / 2 * Math.PI / 180);
      this._panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
      this._panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
    } else if (this.object.isOrthographicCamera) {
      this._panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
      this._panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
      this.enablePan = false;
    }
  }
  _dollyOut(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale /= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _dollyIn(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale *= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _updateZoomParameters(x, y) {
    if (!this.zoomToCursor) {
      return;
    }
    this._performCursorZoom = true;
    const rect = this.domElement.getBoundingClientRect();
    const dx = x - rect.left;
    const dy = y - rect.top;
    const w = rect.width;
    const h = rect.height;
    this._mouse.x = dx / w * 2 - 1;
    this._mouse.y = -(dy / h) * 2 + 1;
    this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(dist) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, dist));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(event) {
    this._rotateStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownDolly(event) {
    this._updateZoomParameters(event.clientX, event.clientX);
    this._dollyStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownPan(event) {
    this._panStart.set(event.clientX, event.clientY);
  }
  _handleMouseMoveRotate(event) {
    this._rotateEnd.set(event.clientX, event.clientY);
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
    this.update();
  }
  _handleMouseMoveDolly(event) {
    this._dollyEnd.set(event.clientX, event.clientY);
    this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);
    if (this._dollyDelta.y > 0) {
      this._dollyOut(this._getZoomScale(this._dollyDelta.y));
    } else if (this._dollyDelta.y < 0) {
      this._dollyIn(this._getZoomScale(this._dollyDelta.y));
    }
    this._dollyStart.copy(this._dollyEnd);
    this.update();
  }
  _handleMouseMovePan(event) {
    this._panEnd.set(event.clientX, event.clientY);
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
    this.update();
  }
  _handleMouseWheel(event) {
    this._updateZoomParameters(event.clientX, event.clientY);
    if (event.deltaY < 0) {
      this._dollyIn(this._getZoomScale(event.deltaY));
    } else if (event.deltaY > 0) {
      this._dollyOut(this._getZoomScale(event.deltaY));
    }
    this.update();
  }
  _handleKeyDown(event) {
    let needsUpdate = false;
    switch (event.code) {
      case this.keys.UP:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateUp(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(0, this.keyPanSpeed);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.BOTTOM:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateUp(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(0, -this.keyPanSpeed);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateLeft(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(this.keyPanSpeed, 0);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.RIGHT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateLeft(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(-this.keyPanSpeed, 0);
          }
        }
        needsUpdate = true;
        break;
    }
    if (needsUpdate) {
      event.preventDefault();
      this.update();
    }
  }
  _handleTouchStartRotate(event) {
    if (this._pointers.length === 1) {
      this._rotateStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateStart.set(x, y);
    }
  }
  _handleTouchStartPan(event) {
    if (this._pointers.length === 1) {
      this._panStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panStart.set(x, y);
    }
  }
  _handleTouchStartDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyStart.set(0, distance);
  }
  _handleTouchStartDollyPan(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enablePan) this._handleTouchStartPan(event);
  }
  _handleTouchStartDollyRotate(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enableRotate) this._handleTouchStartRotate(event);
  }
  _handleTouchMoveRotate(event) {
    if (this._pointers.length == 1) {
      this._rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateEnd.set(x, y);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(event) {
    if (this._pointers.length === 1) {
      this._panEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panEnd.set(x, y);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyEnd.set(0, distance);
    this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed));
    this._dollyOut(this._dollyDelta.y);
    this._dollyStart.copy(this._dollyEnd);
    const centerX = (event.pageX + position.x) * 0.5;
    const centerY = (event.pageY + position.y) * 0.5;
    this._updateZoomParameters(centerX, centerY);
  }
  _handleTouchMoveDollyPan(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enablePan) this._handleTouchMovePan(event);
  }
  _handleTouchMoveDollyRotate(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enableRotate) this._handleTouchMoveRotate(event);
  }
  // pointers
  _addPointer(event) {
    this._pointers.push(event.pointerId);
  }
  _removePointer(event) {
    delete this._pointerPositions[event.pointerId];
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) {
        this._pointers.splice(i, 1);
        return;
      }
    }
  }
  _isTrackingPointer(event) {
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) return true;
    }
    return false;
  }
  _trackPointer(event) {
    let position = this._pointerPositions[event.pointerId];
    if (position === void 0) {
      position = new Vector22();
      this._pointerPositions[event.pointerId] = position;
    }
    position.set(event.pageX, event.pageY);
  }
  _getSecondPointerPosition(event) {
    const pointerId = event.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[pointerId];
  }
  //
  _customWheelEvent(event) {
    const mode = event.deltaMode;
    const newEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY
    };
    switch (mode) {
      case 1:
        newEvent.deltaY *= 16;
        break;
      case 2:
        newEvent.deltaY *= 100;
        break;
    }
    if (event.ctrlKey && !this._controlActive) {
      newEvent.deltaY *= 10;
    }
    return newEvent;
  }
};
function onPointerDown(event) {
  if (this.enabled === false) return;
  if (this._pointers.length === 0) {
    this.domElement.setPointerCapture(event.pointerId);
    this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove);
    this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp);
  }
  if (this._isTrackingPointer(event)) return;
  this._addPointer(event);
  if (event.pointerType === "touch") {
    this._onTouchStart(event);
  } else {
    this._onMouseDown(event);
  }
  if (this._cursorStyle === "grab") {
    this.domElement.style.cursor = "grabbing";
  }
}
function onPointerMove(event) {
  if (this.enabled === false) return;
  if (event.pointerType === "touch") {
    this._onTouchMove(event);
  } else {
    this._onMouseMove(event);
  }
}
function onPointerUp(event) {
  this._removePointer(event);
  switch (this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(event.pointerId);
      this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove);
      this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp);
      this.dispatchEvent(_endEvent);
      this.state = _STATE.NONE;
      if (this._cursorStyle === "grab") {
        this.domElement.style.cursor = "grab";
      }
      break;
    case 1:
      const pointerId = this._pointers[0];
      const position = this._pointerPositions[pointerId];
      this._onTouchStart({ pointerId, pageX: position.x, pageY: position.y });
      break;
  }
}
function onMouseDown(event) {
  let mouseAction;
  switch (event.button) {
    case 0:
      mouseAction = this.mouseButtons.LEFT;
      break;
    case 1:
      mouseAction = this.mouseButtons.MIDDLE;
      break;
    case 2:
      mouseAction = this.mouseButtons.RIGHT;
      break;
    default:
      mouseAction = -1;
  }
  switch (mouseAction) {
    case MOUSE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseDownDolly(event);
      this.state = _STATE.DOLLY;
      break;
    case MOUSE.ROTATE:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      } else {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      }
      break;
    case MOUSE.PAN:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      } else {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onMouseMove(event) {
  switch (this.state) {
    case _STATE.ROTATE:
      if (this.enableRotate === false) return;
      this._handleMouseMoveRotate(event);
      break;
    case _STATE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseMoveDolly(event);
      break;
    case _STATE.PAN:
      if (this.enablePan === false) return;
      this._handleMouseMovePan(event);
      break;
  }
}
function onMouseWheel(event) {
  if (this.enabled === false || this.enableZoom === false || this.state !== _STATE.NONE) return;
  event.preventDefault();
  this.dispatchEvent(_startEvent);
  this._handleMouseWheel(this._customWheelEvent(event));
  this.dispatchEvent(_endEvent);
}
function onKeyDown(event) {
  if (this.enabled === false) return;
  this._handleKeyDown(event);
}
function onTouchStart(event) {
  this._trackPointer(event);
  switch (this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case TOUCH.ROTATE:
          if (this.enableRotate === false) return;
          this._handleTouchStartRotate(event);
          this.state = _STATE.TOUCH_ROTATE;
          break;
        case TOUCH.PAN:
          if (this.enablePan === false) return;
          this._handleTouchStartPan(event);
          this.state = _STATE.TOUCH_PAN;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case TOUCH.DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return;
          this._handleTouchStartDollyPan(event);
          this.state = _STATE.TOUCH_DOLLY_PAN;
          break;
        case TOUCH.DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return;
          this._handleTouchStartDollyRotate(event);
          this.state = _STATE.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onTouchMove(event) {
  this._trackPointer(event);
  switch (this.state) {
    case _STATE.TOUCH_ROTATE:
      if (this.enableRotate === false) return;
      this._handleTouchMoveRotate(event);
      this.update();
      break;
    case _STATE.TOUCH_PAN:
      if (this.enablePan === false) return;
      this._handleTouchMovePan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_PAN:
      if (this.enableZoom === false && this.enablePan === false) return;
      this._handleTouchMoveDollyPan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === false && this.enableRotate === false) return;
      this._handleTouchMoveDollyRotate(event);
      this.update();
      break;
    default:
      this.state = _STATE.NONE;
  }
}
function onContextMenu(event) {
  if (this.enabled === false) return;
  event.preventDefault();
}
function interceptControlDown(event) {
  if (event.key === "Control") {
    this._controlActive = true;
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}
function interceptControlUp(event) {
  if (event.key === "Control") {
    this._controlActive = false;
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}

// ../BM83-Universe26-Simulator/node_modules/three/examples/jsm/loaders/SVGLoader.js
import {
  Box2,
  BufferGeometry as BufferGeometry3,
  CanvasTexture,
  ClampToEdgeWrapping as ClampToEdgeWrapping2,
  Color as Color2,
  DoubleSide as DoubleSide2,
  FileLoader as FileLoader2,
  Float32BufferAttribute as Float32BufferAttribute2,
  Loader as Loader2,
  Matrix3,
  MeshBasicMaterial as MeshBasicMaterial2,
  MirroredRepeatWrapping as MirroredRepeatWrapping2,
  Path,
  RepeatWrapping as RepeatWrapping2,
  ShapePath,
  ShapeUtils,
  SRGBColorSpace as SRGBColorSpace2,
  Vector2 as Vector23,
  Vector3 as Vector35
} from "../vendor/three/three.module.js";
var COLOR_SPACE_SVG = SRGBColorSpace2;
var SVGLoader = class _SVGLoader extends Loader2 {
  /**
   * Constructs a new SVG loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(manager) {
    super(manager);
    this.defaultDPI = 90;
    this.defaultUnit = "px";
  }
  /**
   * Starts loading from the given URL and passes the loaded SVG asset
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function({paths:Array<ShapePath>,xml:string})} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(url, onLoad, onProgress, onError) {
    const scope = this;
    const loader = new FileLoader2(scope.manager);
    loader.setPath(scope.path);
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(url, function(text) {
      try {
        onLoad(scope.parse(text));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  }
  /**
   * Parses the given SVG data and returns the resulting data.
   *
   * @param {string} text - The raw SVG data as a string.
   * @return {{paths:Array<ShapePath>,xml:string}} An object holding an array of shape paths and the
   * SVG XML document.
   */
  parse(text) {
    const scope = this;
    function parseNode(node, style) {
      if (node.nodeType !== 1) return;
      if (node.hasAttribute("filter")) {
        console.warn("THREE.SVGLoader: Filters are not supported.");
      }
      const transform = getNodeTransform(node);
      let isDefsNode = false;
      let path = null;
      switch (node.nodeName) {
        case "svg":
          style = parseStyle(node, style);
          break;
        case "style":
          parseCSSStylesheet(node);
          break;
        case "g":
          style = parseStyle(node, style);
          break;
        case "path":
          style = parseStyle(node, style);
          if (node.hasAttribute("d")) path = parsePathNode(node);
          break;
        case "rect":
          style = parseStyle(node, style);
          path = parseRectNode(node);
          break;
        case "polygon":
          style = parseStyle(node, style);
          path = parsePolygonNode(node);
          break;
        case "polyline":
          style = parseStyle(node, style);
          path = parsePolylineNode(node);
          break;
        case "circle":
          style = parseStyle(node, style);
          path = parseCircleNode(node);
          break;
        case "ellipse":
          style = parseStyle(node, style);
          path = parseEllipseNode(node);
          break;
        case "line":
          style = parseStyle(node, style);
          path = parseLineNode(node);
          break;
        case "defs":
          isDefsNode = true;
          break;
        case "use":
          style = parseStyle(node, style);
          const href = node.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
          const usedNodeId = href.substring(1);
          const usedNode = node.viewportElement.getElementById(usedNodeId);
          if (usedNode) {
            parseNode(usedNode, style);
          } else {
            console.warn("SVGLoader: 'use node' references non-existent node id: " + usedNodeId);
          }
          break;
        default:
      }
      if (path) {
        if (style.fill !== void 0 && style.fill !== "none" && !style.fill.startsWith("url")) {
          path.color.setStyle(style.fill, COLOR_SPACE_SVG);
        }
        transformPath(path, currentTransform);
        paths.push(path);
        const pathStyle = Object.assign({}, style);
        pathStyle.strokeWidth = style.strokeWidth * getTransformScale(currentTransform);
        path.userData = { node, style: pathStyle, transform: currentTransform.clone(), gradients };
      }
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const node2 = childNodes[i];
        if (isDefsNode && node2.nodeName !== "style" && node2.nodeName !== "defs") {
          continue;
        }
        parseNode(node2, style);
      }
      if (transform) {
        transformStack.pop();
        if (transformStack.length > 0) {
          currentTransform.copy(transformStack[transformStack.length - 1]);
        } else {
          currentTransform.identity();
        }
      }
    }
    function parsePathNode(node) {
      const path = new ShapePath();
      const point = new Vector23();
      const control = new Vector23();
      const firstPoint = new Vector23();
      let isFirstPoint = true;
      let doSetFirstPoint = false;
      const d = node.getAttribute("d");
      if (d === "" || d === "none") return null;
      const commands = d.match(/[a-df-z][^a-df-z]*/ig);
      for (let i = 0, l = commands.length; i < l; i++) {
        const command = commands[i];
        const type = command.charAt(0);
        const data2 = command.slice(1).trim();
        if (isFirstPoint === true) {
          doSetFirstPoint = true;
          isFirstPoint = false;
        }
        let numbers;
        switch (type) {
          case "M":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              if (j === 0) {
                path.moveTo(point.x, point.y);
              } else {
                path.lineTo(point.x, point.y);
              }
              if (j === 0) firstPoint.copy(point);
            }
            break;
          case "H":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.x = numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "V":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.y = numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "L":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "C":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 6) {
              path.bezierCurveTo(
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                numbers[j + 5]
              );
              control.x = numbers[j + 2];
              control.y = numbers[j + 3];
              point.x = numbers[j + 4];
              point.y = numbers[j + 5];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "S":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.bezierCurveTo(
                getReflection(point.x, control.x),
                getReflection(point.y, control.y),
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3]
              );
              control.x = numbers[j + 0];
              control.y = numbers[j + 1];
              point.x = numbers[j + 2];
              point.y = numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "Q":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.quadraticCurveTo(
                numbers[j + 0],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3]
              );
              control.x = numbers[j + 0];
              control.y = numbers[j + 1];
              point.x = numbers[j + 2];
              point.y = numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "T":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              const rx = getReflection(point.x, control.x);
              const ry = getReflection(point.y, control.y);
              path.quadraticCurveTo(
                rx,
                ry,
                numbers[j + 0],
                numbers[j + 1]
              );
              control.x = rx;
              control.y = ry;
              point.x = numbers[j + 0];
              point.y = numbers[j + 1];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "A":
            numbers = parseFloats(data2, [3, 4], 7);
            for (let j = 0, jl = numbers.length; j < jl; j += 7) {
              if (numbers[j + 5] == point.x && numbers[j + 6] == point.y) continue;
              const start = point.clone();
              point.x = numbers[j + 5];
              point.y = numbers[j + 6];
              control.x = point.x;
              control.y = point.y;
              parseArcCommand(
                path,
                numbers[j],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                start,
                point
              );
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "m":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x += numbers[j + 0];
              point.y += numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              if (j === 0) {
                path.moveTo(point.x, point.y);
              } else {
                path.lineTo(point.x, point.y);
              }
              if (j === 0) firstPoint.copy(point);
            }
            break;
          case "h":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.x += numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "v":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j++) {
              point.y += numbers[j];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "l":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              point.x += numbers[j + 0];
              point.y += numbers[j + 1];
              control.x = point.x;
              control.y = point.y;
              path.lineTo(point.x, point.y);
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "c":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 6) {
              path.bezierCurveTo(
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3],
                point.x + numbers[j + 4],
                point.y + numbers[j + 5]
              );
              control.x = point.x + numbers[j + 2];
              control.y = point.y + numbers[j + 3];
              point.x += numbers[j + 4];
              point.y += numbers[j + 5];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "s":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.bezierCurveTo(
                getReflection(point.x, control.x),
                getReflection(point.y, control.y),
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3]
              );
              control.x = point.x + numbers[j + 0];
              control.y = point.y + numbers[j + 1];
              point.x += numbers[j + 2];
              point.y += numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "q":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 4) {
              path.quadraticCurveTo(
                point.x + numbers[j + 0],
                point.y + numbers[j + 1],
                point.x + numbers[j + 2],
                point.y + numbers[j + 3]
              );
              control.x = point.x + numbers[j + 0];
              control.y = point.y + numbers[j + 1];
              point.x += numbers[j + 2];
              point.y += numbers[j + 3];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "t":
            numbers = parseFloats(data2);
            for (let j = 0, jl = numbers.length; j < jl; j += 2) {
              const rx = getReflection(point.x, control.x);
              const ry = getReflection(point.y, control.y);
              path.quadraticCurveTo(
                rx,
                ry,
                point.x + numbers[j + 0],
                point.y + numbers[j + 1]
              );
              control.x = rx;
              control.y = ry;
              point.x = point.x + numbers[j + 0];
              point.y = point.y + numbers[j + 1];
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "a":
            numbers = parseFloats(data2, [3, 4], 7);
            for (let j = 0, jl = numbers.length; j < jl; j += 7) {
              if (numbers[j + 5] == 0 && numbers[j + 6] == 0) continue;
              const start = point.clone();
              point.x += numbers[j + 5];
              point.y += numbers[j + 6];
              control.x = point.x;
              control.y = point.y;
              parseArcCommand(
                path,
                numbers[j],
                numbers[j + 1],
                numbers[j + 2],
                numbers[j + 3],
                numbers[j + 4],
                start,
                point
              );
              if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
            }
            break;
          case "Z":
          case "z":
            path.currentPath.autoClose = true;
            if (path.currentPath.curves.length > 0) {
              point.copy(firstPoint);
              path.currentPath.currentPoint.copy(point);
              isFirstPoint = true;
            }
            break;
          default:
            console.warn(command);
        }
        doSetFirstPoint = false;
      }
      return path;
    }
    function parseCSSStylesheet(node) {
      if (!node.sheet || !node.sheet.cssRules || !node.sheet.cssRules.length) return;
      for (let i = 0; i < node.sheet.cssRules.length; i++) {
        const stylesheet = node.sheet.cssRules[i];
        if (stylesheet.type !== 1) continue;
        const selectorList = stylesheet.selectorText.split(/,/gm).filter(Boolean).map((i2) => i2.trim());
        for (let j = 0; j < selectorList.length; j++) {
          const definitions = Object.fromEntries(
            Object.entries(stylesheet.style).filter(([, v]) => v !== "")
          );
          stylesheets[selectorList[j]] = Object.assign(
            stylesheets[selectorList[j]] || {},
            definitions
          );
        }
      }
    }
    function parseArcCommand(path, rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, start, end) {
      if (rx == 0 || ry == 0) {
        path.lineTo(end.x, end.y);
        return;
      }
      x_axis_rotation = x_axis_rotation * Math.PI / 180;
      rx = Math.abs(rx);
      ry = Math.abs(ry);
      const dx2 = (start.x - end.x) / 2;
      const dy2 = (start.y - end.y) / 2;
      const x1p = Math.cos(x_axis_rotation) * dx2 + Math.sin(x_axis_rotation) * dy2;
      const y1p = -Math.sin(x_axis_rotation) * dx2 + Math.cos(x_axis_rotation) * dy2;
      let rxs = rx * rx;
      let rys = ry * ry;
      const x1ps = x1p * x1p;
      const y1ps = y1p * y1p;
      const cr = x1ps / rxs + y1ps / rys;
      if (cr > 1) {
        const s = Math.sqrt(cr);
        rx = s * rx;
        ry = s * ry;
        rxs = rx * rx;
        rys = ry * ry;
      }
      const dq = rxs * y1ps + rys * x1ps;
      const pq = (rxs * rys - dq) / dq;
      let q = Math.sqrt(Math.max(0, pq));
      if (large_arc_flag === sweep_flag) q = -q;
      const cxp = q * rx * y1p / ry;
      const cyp = -q * ry * x1p / rx;
      const cx = Math.cos(x_axis_rotation) * cxp - Math.sin(x_axis_rotation) * cyp + (start.x + end.x) / 2;
      const cy = Math.sin(x_axis_rotation) * cxp + Math.cos(x_axis_rotation) * cyp + (start.y + end.y) / 2;
      const theta = svgAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
      const delta = svgAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry) % (Math.PI * 2);
      path.currentPath.absellipse(cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation);
    }
    function svgAngle(ux, uy, vx, vy) {
      const dot = ux * vx + uy * vy;
      const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
      let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
      if (ux * vy - uy * vx < 0) ang = -ang;
      return ang;
    }
    function parseRectNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("x") || 0);
      const y = parseFloatWithUnits(node.getAttribute("y") || 0);
      const rx = parseFloatWithUnits(node.getAttribute("rx") || node.getAttribute("ry") || 0);
      const ry = parseFloatWithUnits(node.getAttribute("ry") || node.getAttribute("rx") || 0);
      const w = parseFloatWithUnits(node.getAttribute("width"));
      const h = parseFloatWithUnits(node.getAttribute("height"));
      const bci = 1 - 0.551915024494;
      const path = new ShapePath();
      path.moveTo(x + rx, y);
      path.lineTo(x + w - rx, y);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + w - rx * bci,
          y,
          x + w,
          y + ry * bci,
          x + w,
          y + ry
        );
      }
      path.lineTo(x + w, y + h - ry);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + w,
          y + h - ry * bci,
          x + w - rx * bci,
          y + h,
          x + w - rx,
          y + h
        );
      }
      path.lineTo(x + rx, y + h);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(
          x + rx * bci,
          y + h,
          x,
          y + h - ry * bci,
          x,
          y + h - ry
        );
      }
      path.lineTo(x, y + ry);
      if (rx !== 0 || ry !== 0) {
        path.bezierCurveTo(x, y + ry * bci, x + rx * bci, y, x + rx, y);
      }
      return path;
    }
    function parsePolygonNode(node) {
      function iterator(match, a, b) {
        const x = parseFloatWithUnits(a);
        const y = parseFloatWithUnits(b);
        if (index === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        index++;
      }
      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;
      const path = new ShapePath();
      let index = 0;
      node.getAttribute("points").replace(regex, iterator);
      path.currentPath.autoClose = true;
      return path;
    }
    function parsePolylineNode(node) {
      function iterator(match, a, b) {
        const x = parseFloatWithUnits(a);
        const y = parseFloatWithUnits(b);
        if (index === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        index++;
      }
      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;
      const path = new ShapePath();
      let index = 0;
      node.getAttribute("points").replace(regex, iterator);
      path.currentPath.autoClose = false;
      return path;
    }
    function parseCircleNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("cx") || 0);
      const y = parseFloatWithUnits(node.getAttribute("cy") || 0);
      const r = parseFloatWithUnits(node.getAttribute("r") || 0);
      const subpath = new Path();
      subpath.absarc(x, y, r, 0, Math.PI * 2);
      const path = new ShapePath();
      path.subPaths.push(subpath);
      return path;
    }
    function parseEllipseNode(node) {
      const x = parseFloatWithUnits(node.getAttribute("cx") || 0);
      const y = parseFloatWithUnits(node.getAttribute("cy") || 0);
      const rx = parseFloatWithUnits(node.getAttribute("rx") || 0);
      const ry = parseFloatWithUnits(node.getAttribute("ry") || 0);
      const subpath = new Path();
      subpath.absellipse(x, y, rx, ry, 0, Math.PI * 2);
      const path = new ShapePath();
      path.subPaths.push(subpath);
      return path;
    }
    function parseLineNode(node) {
      const x1 = parseFloatWithUnits(node.getAttribute("x1") || 0);
      const y1 = parseFloatWithUnits(node.getAttribute("y1") || 0);
      const x2 = parseFloatWithUnits(node.getAttribute("x2") || 0);
      const y2 = parseFloatWithUnits(node.getAttribute("y2") || 0);
      const path = new ShapePath();
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
      path.currentPath.autoClose = false;
      return path;
    }
    function parseGradients(xml2) {
      const HREF_NS = "http://www.w3.org/1999/xlink";
      const gradientNodes = xml2.querySelectorAll("linearGradient, radialGradient");
      const ATTRS = ["x1", "y1", "x2", "y2", "cx", "cy", "r", "fx", "fy", "gradientUnits", "gradientTransform", "spreadMethod"];
      const parsed = {};
      for (const node of gradientNodes) {
        const id = node.getAttribute("id");
        if (!id) continue;
        const entry = {
          type: node.nodeName === "radialGradient" ? "radialGradient" : "linearGradient",
          attrs: {},
          stops: null,
          href: null
        };
        const href = node.getAttributeNS(HREF_NS, "href") || node.getAttribute("href") || "";
        if (href.startsWith("#")) entry.href = href.substring(1);
        for (const name of ATTRS) {
          if (node.hasAttribute(name)) entry.attrs[name] = node.getAttribute(name);
        }
        const stopNodes = node.querySelectorAll("stop");
        if (stopNodes.length > 0) {
          entry.stops = [];
          for (const s of stopNodes) {
            let color = s.getAttribute("stop-color");
            if (!color && s.style) color = s.style["stop-color"];
            if (!color) color = "#000";
            let opacity = s.getAttribute("stop-opacity");
            if ((opacity === null || opacity === "") && s.style) opacity = s.style["stop-opacity"];
            opacity = opacity === null || opacity === "" || opacity === void 0 ? 1 : Math.max(0, Math.min(1, parseFloat(opacity)));
            const offset = Math.max(0, Math.min(1, parseFloat(s.getAttribute("offset") || "0")));
            entry.stops.push({ offset, color, opacity });
          }
        }
        parsed[id] = entry;
      }
      function inherit(id, visited) {
        const entry = parsed[id];
        if (!entry || visited.has(id)) return entry;
        visited.add(id);
        if (entry.href && parsed[entry.href]) {
          const parent = inherit(entry.href, visited);
          if (parent) {
            if (!entry.stops) entry.stops = parent.stops;
            for (const key in parent.attrs) {
              if (!(key in entry.attrs)) entry.attrs[key] = parent.attrs[key];
            }
          }
        }
        return entry;
      }
      for (const id in parsed) inherit(id, /* @__PURE__ */ new Set());
      for (const id in parsed) {
        let coord = function(str) {
          if (typeof str !== "string") return 0;
          if (str.endsWith("%")) return parseFloat(str) / 100;
          return parseFloatWithUnits(str);
        };
        const entry = parsed[id];
        const a = entry.attrs;
        const units2 = a.gradientUnits === "userSpaceOnUse" ? "userSpaceOnUse" : "objectBoundingBox";
        const gradient = {
          type: entry.type,
          gradientUnits: units2,
          spreadMethod: a.spreadMethod === "reflect" || a.spreadMethod === "repeat" ? a.spreadMethod : "pad",
          gradientTransform: null,
          stops: (entry.stops || []).slice().sort((x, y) => x.offset - y.offset)
        };
        if (a.gradientTransform) {
          gradient.gradientTransform = new Matrix3();
          parseTransformString(a.gradientTransform, gradient.gradientTransform);
        }
        if (entry.type === "linearGradient") {
          gradient.x1 = a.x1 !== void 0 ? coord(a.x1) : 0;
          gradient.y1 = a.y1 !== void 0 ? coord(a.y1) : 0;
          gradient.x2 = a.x2 !== void 0 ? coord(a.x2) : units2 === "objectBoundingBox" ? 1 : 0;
          gradient.y2 = a.y2 !== void 0 ? coord(a.y2) : 0;
        } else {
          const defCenter = units2 === "objectBoundingBox" ? 0.5 : 0;
          const defR = units2 === "objectBoundingBox" ? 0.5 : 0;
          gradient.cx = a.cx !== void 0 ? coord(a.cx) : defCenter;
          gradient.cy = a.cy !== void 0 ? coord(a.cy) : defCenter;
          gradient.r = a.r !== void 0 ? coord(a.r) : defR;
          gradient.fx = a.fx !== void 0 ? coord(a.fx) : gradient.cx;
          gradient.fy = a.fy !== void 0 ? coord(a.fy) : gradient.cy;
        }
        gradients[id] = gradient;
      }
    }
    function parseStyle(node, style) {
      style = Object.assign({}, style);
      let stylesheetStyles = {};
      if (node.hasAttribute("class")) {
        const classSelectors = node.getAttribute("class").split(/\s/).filter(Boolean).map((i) => i.trim());
        for (let i = 0; i < classSelectors.length; i++) {
          stylesheetStyles = Object.assign(stylesheetStyles, stylesheets["." + classSelectors[i]]);
        }
      }
      if (node.hasAttribute("id")) {
        stylesheetStyles = Object.assign(stylesheetStyles, stylesheets["#" + node.getAttribute("id")]);
      }
      function addStyle(svgName, jsName, adjustFunction) {
        if (adjustFunction === void 0) adjustFunction = function copy(v) {
          return v;
        };
        if (node.hasAttribute(svgName)) style[jsName] = adjustFunction(node.getAttribute(svgName));
        if (stylesheetStyles[jsName]) style[jsName] = adjustFunction(stylesheetStyles[jsName]);
        if (node.style && node.style[svgName] !== "") style[jsName] = adjustFunction(node.style[svgName]);
      }
      function clamp(v) {
        return Math.max(0, Math.min(1, parseFloatWithUnits(v)));
      }
      function positive(v) {
        return Math.max(0, parseFloatWithUnits(v));
      }
      addStyle("fill", "fill");
      addStyle("fill-opacity", "fillOpacity", clamp);
      addStyle("fill-rule", "fillRule");
      addStyle("opacity", "opacity", clamp);
      addStyle("stroke", "stroke");
      addStyle("stroke-opacity", "strokeOpacity", clamp);
      addStyle("stroke-width", "strokeWidth", positive);
      addStyle("stroke-linejoin", "strokeLineJoin");
      addStyle("stroke-linecap", "strokeLineCap");
      addStyle("stroke-miterlimit", "strokeMiterLimit", positive);
      addStyle("visibility", "visibility");
      return style;
    }
    function getReflection(a, b) {
      return a - (b - a);
    }
    function parseFloats(input, flags, stride) {
      if (typeof input !== "string") {
        throw new TypeError("Invalid input: " + typeof input);
      }
      const RE = {
        SEPARATOR: /[ \t\r\n\,.\-+]/,
        WHITESPACE: /[ \t\r\n]/,
        DIGIT: /[\d]/,
        SIGN: /[-+]/,
        POINT: /\./,
        COMMA: /,/,
        EXP: /e/i,
        FLAGS: /[01]/
      };
      const SEP = 0;
      const INT = 1;
      const FLOAT = 2;
      const EXP = 3;
      let state = SEP;
      let seenComma = true;
      let number = "", exponent = "";
      const result = [];
      function throwSyntaxError(current2, i, partial) {
        const error = new SyntaxError('Unexpected character "' + current2 + '" at index ' + i + ".");
        error.partial = partial;
        throw error;
      }
      function newNumber() {
        if (number !== "") {
          if (exponent === "") result.push(Number(number));
          else result.push(Number(number) * Math.pow(10, Number(exponent)));
        }
        number = "";
        exponent = "";
      }
      let current;
      const length = input.length;
      for (let i = 0; i < length; i++) {
        current = input[i];
        if (Array.isArray(flags) && flags.includes(result.length % stride) && RE.FLAGS.test(current)) {
          state = INT;
          number = current;
          newNumber();
          continue;
        }
        if (state === SEP) {
          if (RE.WHITESPACE.test(current)) {
            continue;
          }
          if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {
            state = INT;
            number = current;
            continue;
          }
          if (RE.POINT.test(current)) {
            state = FLOAT;
            number = current;
            continue;
          }
          if (RE.COMMA.test(current)) {
            if (seenComma) {
              throwSyntaxError(current, i, result);
            }
            seenComma = true;
          }
        }
        if (state === INT) {
          if (RE.DIGIT.test(current)) {
            number += current;
            continue;
          }
          if (RE.POINT.test(current)) {
            number += current;
            state = FLOAT;
            continue;
          }
          if (RE.EXP.test(current)) {
            state = EXP;
            continue;
          }
          if (RE.SIGN.test(current) && number.length === 1 && RE.SIGN.test(number[0])) {
            throwSyntaxError(current, i, result);
          }
        }
        if (state === FLOAT) {
          if (RE.DIGIT.test(current)) {
            number += current;
            continue;
          }
          if (RE.EXP.test(current)) {
            state = EXP;
            continue;
          }
          if (RE.POINT.test(current) && number[number.length - 1] === ".") {
            throwSyntaxError(current, i, result);
          }
        }
        if (state === EXP) {
          if (RE.DIGIT.test(current)) {
            exponent += current;
            continue;
          }
          if (RE.SIGN.test(current)) {
            if (exponent === "") {
              exponent += current;
              continue;
            }
            if (exponent.length === 1 && RE.SIGN.test(exponent)) {
              throwSyntaxError(current, i, result);
            }
          }
        }
        if (RE.WHITESPACE.test(current)) {
          newNumber();
          state = SEP;
          seenComma = false;
        } else if (RE.COMMA.test(current)) {
          newNumber();
          state = SEP;
          seenComma = true;
        } else if (RE.SIGN.test(current)) {
          newNumber();
          state = INT;
          number = current;
        } else if (RE.POINT.test(current)) {
          newNumber();
          state = FLOAT;
          number = current;
        } else {
          throwSyntaxError(current, i, result);
        }
      }
      newNumber();
      return result;
    }
    const units = ["mm", "cm", "in", "pt", "pc", "px"];
    const unitConversion = {
      "mm": {
        "mm": 1,
        "cm": 0.1,
        "in": 1 / 25.4,
        "pt": 72 / 25.4,
        "pc": 6 / 25.4,
        "px": -1
      },
      "cm": {
        "mm": 10,
        "cm": 1,
        "in": 1 / 2.54,
        "pt": 72 / 2.54,
        "pc": 6 / 2.54,
        "px": -1
      },
      "in": {
        "mm": 25.4,
        "cm": 2.54,
        "in": 1,
        "pt": 72,
        "pc": 6,
        "px": -1
      },
      "pt": {
        "mm": 25.4 / 72,
        "cm": 2.54 / 72,
        "in": 1 / 72,
        "pt": 1,
        "pc": 6 / 72,
        "px": -1
      },
      "pc": {
        "mm": 25.4 / 6,
        "cm": 2.54 / 6,
        "in": 1 / 6,
        "pt": 72 / 6,
        "pc": 1,
        "px": -1
      },
      "px": {
        "px": 1
      }
    };
    function parseFloatWithUnits(string) {
      let theUnit = "px";
      if (typeof string === "string" || string instanceof String) {
        for (let i = 0, n = units.length; i < n; i++) {
          const u = units[i];
          if (string.endsWith(u)) {
            theUnit = u;
            string = string.substring(0, string.length - u.length);
            break;
          }
        }
      }
      let scale = void 0;
      if (theUnit === "px" && scope.defaultUnit !== "px") {
        scale = unitConversion["in"][scope.defaultUnit] / scope.defaultDPI;
      } else {
        scale = unitConversion[theUnit][scope.defaultUnit];
        if (scale < 0) {
          scale = unitConversion[theUnit]["in"] * scope.defaultDPI;
        }
      }
      return scale * parseFloat(string);
    }
    function getNodeTransform(node) {
      if (!(node.hasAttribute("transform") || node.nodeName === "use" && (node.hasAttribute("x") || node.hasAttribute("y")))) {
        return null;
      }
      const transform = parseNodeTransform(node);
      if (transformStack.length > 0) {
        transform.premultiply(transformStack[transformStack.length - 1]);
      }
      currentTransform.copy(transform);
      transformStack.push(transform);
      return transform;
    }
    function parseNodeTransform(node) {
      const transform = new Matrix3();
      if (node.nodeName === "use" && (node.hasAttribute("x") || node.hasAttribute("y"))) {
        const tx = parseFloatWithUnits(node.getAttribute("x") || 0);
        const ty = parseFloatWithUnits(node.getAttribute("y") || 0);
        transform.makeTranslation(tx, ty);
      }
      if (node.hasAttribute("transform")) {
        parseTransformString(node.getAttribute("transform"), transform);
      }
      return transform;
    }
    function parseTransformString(text2, transform) {
      const currentTransform2 = tempTransform0;
      const transformsTexts = text2.split(")");
      for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {
        const transformText = transformsTexts[tIndex].trim();
        if (transformText === "") continue;
        const openParPos = transformText.indexOf("(");
        const closeParPos = transformText.length;
        if (openParPos > 0 && openParPos < closeParPos) {
          const transformType = transformText.slice(0, openParPos);
          const array = parseFloats(transformText.slice(openParPos + 1));
          currentTransform2.identity();
          switch (transformType) {
            case "translate":
              if (array.length >= 1) {
                const tx = array[0];
                let ty = 0;
                if (array.length >= 2) {
                  ty = array[1];
                }
                currentTransform2.makeTranslation(tx, ty);
              }
              break;
            case "rotate":
              if (array.length >= 1) {
                let angle = 0;
                let cx = 0;
                let cy = 0;
                angle = array[0] * Math.PI / 180;
                if (array.length >= 3) {
                  cx = array[1];
                  cy = array[2];
                }
                tempTransform1.makeTranslation(-cx, -cy);
                tempTransform2.makeRotation(angle);
                tempTransform3.multiplyMatrices(tempTransform2, tempTransform1);
                tempTransform1.makeTranslation(cx, cy);
                currentTransform2.multiplyMatrices(tempTransform1, tempTransform3);
              }
              break;
            case "scale":
              if (array.length >= 1) {
                const scaleX = array[0];
                let scaleY = scaleX;
                if (array.length >= 2) {
                  scaleY = array[1];
                }
                currentTransform2.makeScale(scaleX, scaleY);
              }
              break;
            case "skewX":
              if (array.length === 1) {
                currentTransform2.set(
                  1,
                  Math.tan(array[0] * Math.PI / 180),
                  0,
                  0,
                  1,
                  0,
                  0,
                  0,
                  1
                );
              }
              break;
            case "skewY":
              if (array.length === 1) {
                currentTransform2.set(
                  1,
                  0,
                  0,
                  Math.tan(array[0] * Math.PI / 180),
                  1,
                  0,
                  0,
                  0,
                  1
                );
              }
              break;
            case "matrix":
              if (array.length === 6) {
                currentTransform2.set(
                  array[0],
                  array[2],
                  array[4],
                  array[1],
                  array[3],
                  array[5],
                  0,
                  0,
                  1
                );
              }
              break;
          }
          transform.premultiply(currentTransform2);
        }
      }
      return transform;
    }
    function transformPath(path, m) {
      function transfVec2(v2) {
        tempV3.set(v2.x, v2.y, 1).applyMatrix3(m);
        v2.set(tempV3.x, tempV3.y);
      }
      function transfEllipseGeneric(curve) {
        const a = curve.xRadius;
        const b = curve.yRadius;
        const cosTheta = Math.cos(curve.aRotation);
        const sinTheta = Math.sin(curve.aRotation);
        const v1 = new Vector35(a * cosTheta, a * sinTheta, 0);
        const v2 = new Vector35(-b * sinTheta, b * cosTheta, 0);
        const f1 = v1.applyMatrix3(m);
        const f2 = v2.applyMatrix3(m);
        const mF = tempTransform0.set(
          f1.x,
          f2.x,
          0,
          f1.y,
          f2.y,
          0,
          0,
          0,
          1
        );
        const mFInv = tempTransform1.copy(mF).invert();
        const mFInvT = tempTransform2.copy(mFInv).transpose();
        const mQ = mFInvT.multiply(mFInv);
        const mQe = mQ.elements;
        const ed = eigenDecomposition(mQe[0], mQe[1], mQe[4]);
        const rt1sqrt = Math.sqrt(ed.rt1);
        const rt2sqrt = Math.sqrt(ed.rt2);
        curve.xRadius = 1 / rt1sqrt;
        curve.yRadius = 1 / rt2sqrt;
        curve.aRotation = Math.atan2(ed.sn, ed.cs);
        const isFullEllipse = (curve.aEndAngle - curve.aStartAngle) % (2 * Math.PI) < Number.EPSILON;
        if (!isFullEllipse) {
          const mDsqrt = tempTransform1.set(
            rt1sqrt,
            0,
            0,
            0,
            rt2sqrt,
            0,
            0,
            0,
            1
          );
          const mRT = tempTransform2.set(
            ed.cs,
            ed.sn,
            0,
            -ed.sn,
            ed.cs,
            0,
            0,
            0,
            1
          );
          const mDRF = mDsqrt.multiply(mRT).multiply(mF);
          const transformAngle = (phi) => {
            const { x: cosR, y: sinR } = new Vector35(Math.cos(phi), Math.sin(phi), 0).applyMatrix3(mDRF);
            return Math.atan2(sinR, cosR);
          };
          curve.aStartAngle = transformAngle(curve.aStartAngle);
          curve.aEndAngle = transformAngle(curve.aEndAngle);
          if (isTransformFlipped(m)) {
            curve.aClockwise = !curve.aClockwise;
          }
        }
      }
      function transfEllipseNoSkew(curve) {
        const sx = getTransformScaleX(m);
        const sy = getTransformScaleY(m);
        curve.xRadius *= sx;
        curve.yRadius *= sy;
        const theta = sx > Number.EPSILON ? Math.atan2(m.elements[1], m.elements[0]) : Math.atan2(-m.elements[3], m.elements[4]);
        curve.aRotation += theta;
        if (isTransformFlipped(m)) {
          curve.aStartAngle *= -1;
          curve.aEndAngle *= -1;
          curve.aClockwise = !curve.aClockwise;
        }
      }
      const subPaths = path.subPaths;
      for (let i = 0, n = subPaths.length; i < n; i++) {
        const subPath = subPaths[i];
        const curves = subPath.curves;
        for (let j = 0; j < curves.length; j++) {
          const curve = curves[j];
          if (curve.isLineCurve) {
            transfVec2(curve.v1);
            transfVec2(curve.v2);
          } else if (curve.isCubicBezierCurve) {
            transfVec2(curve.v0);
            transfVec2(curve.v1);
            transfVec2(curve.v2);
            transfVec2(curve.v3);
          } else if (curve.isQuadraticBezierCurve) {
            transfVec2(curve.v0);
            transfVec2(curve.v1);
            transfVec2(curve.v2);
          } else if (curve.isEllipseCurve) {
            tempV2.set(curve.aX, curve.aY);
            transfVec2(tempV2);
            curve.aX = tempV2.x;
            curve.aY = tempV2.y;
            if (isTransformSkewed(m)) {
              transfEllipseGeneric(curve);
            } else {
              transfEllipseNoSkew(curve);
            }
          }
        }
      }
    }
    function isTransformFlipped(m) {
      const te = m.elements;
      return te[0] * te[4] - te[1] * te[3] < 0;
    }
    function isTransformSkewed(m) {
      const te = m.elements;
      const basisDot = te[0] * te[3] + te[1] * te[4];
      if (basisDot === 0) return false;
      const sx = getTransformScaleX(m);
      const sy = getTransformScaleY(m);
      return Math.abs(basisDot / (sx * sy)) > Number.EPSILON;
    }
    function getTransformScaleX(m) {
      const te = m.elements;
      return Math.sqrt(te[0] * te[0] + te[1] * te[1]);
    }
    function getTransformScaleY(m) {
      const te = m.elements;
      return Math.sqrt(te[3] * te[3] + te[4] * te[4]);
    }
    function getTransformScale(m) {
      const te = m.elements;
      const det = te[0] * te[4] - te[1] * te[3];
      return Math.sqrt(Math.abs(det));
    }
    function eigenDecomposition(A, B, C) {
      let rt1, rt2, cs, sn, t;
      const sm = A + C;
      const df = A - C;
      const rt = Math.sqrt(df * df + 4 * B * B);
      if (sm > 0) {
        rt1 = 0.5 * (sm + rt);
        t = 1 / rt1;
        rt2 = A * t * C - B * t * B;
      } else if (sm < 0) {
        rt2 = 0.5 * (sm - rt);
      } else {
        rt1 = 0.5 * rt;
        rt2 = -0.5 * rt;
      }
      if (df > 0) {
        cs = df + rt;
      } else {
        cs = df - rt;
      }
      if (Math.abs(cs) > 2 * Math.abs(B)) {
        t = -2 * B / cs;
        sn = 1 / Math.sqrt(1 + t * t);
        cs = t * sn;
      } else if (Math.abs(B) === 0) {
        cs = 1;
        sn = 0;
      } else {
        t = -0.5 * cs / B;
        cs = 1 / Math.sqrt(1 + t * t);
        sn = t * cs;
      }
      if (df > 0) {
        t = cs;
        cs = -sn;
        sn = t;
      }
      return { rt1, rt2, cs, sn };
    }
    const paths = [];
    const stylesheets = {};
    const gradients = {};
    const transformStack = [];
    const tempTransform0 = new Matrix3();
    const tempTransform1 = new Matrix3();
    const tempTransform2 = new Matrix3();
    const tempTransform3 = new Matrix3();
    const tempV2 = new Vector23();
    const tempV3 = new Vector35();
    const currentTransform = new Matrix3();
    const xml = new DOMParser().parseFromString(text, "image/svg+xml");
    parseGradients(xml);
    parseNode(xml.documentElement, {
      fill: "#000",
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeLineJoin: "miter",
      strokeLineCap: "butt",
      strokeMiterLimit: 4
    });
    const data = { paths, gradients, xml: xml.documentElement };
    return data;
  }
  /**
   * Creates a material for rendering the fill of the given path.
   *
   * @param {ShapePath} shapePath - The shape path.
   * @return {?MeshBasicMaterial} The fill material. `null` if the path has no fill.
   */
  static createFillMaterial(shapePath) {
    const style = shapePath.userData.style;
    if (style.fill === void 0 || style.fill === "none") return null;
    const color = shapePath.color;
    let texture = null;
    const urlMatch = GRADIENT_URL_RE.exec(style.fill);
    if (urlMatch) {
      const gradient = shapePath.userData.gradients && shapePath.userData.gradients[urlMatch[1]];
      texture = buildGradientTexture(gradient, shapePath);
    }
    const material = new MeshBasicMaterial2({
      opacity: style.fillOpacity * (style.opacity || 1),
      transparent: true,
      side: DoubleSide2,
      depthWrite: false
    });
    if (texture !== null) {
      material.map = texture;
    } else {
      material.color = color;
    }
    return material;
  }
  /**
   * Creates a material for rendering the stroke of the given path.
   *
   * @param {ShapePath} shapePath - The shape path.
   * @return {?MeshBasicMaterial} The stroke material. `null` if the path has no stroke.
   */
  static createStrokeMaterial(shapePath) {
    const style = shapePath.userData.style;
    if (style.stroke === void 0 || style.stroke === "none") return null;
    if (GRADIENT_URL_RE.test(style.stroke)) {
      console.warn("THREE.SVGLoader: Gradient strokes are not supported.");
    }
    return new MeshBasicMaterial2({
      color: new Color2().setStyle(style.stroke, COLOR_SPACE_SVG),
      opacity: style.strokeOpacity * (style.opacity || 1),
      transparent: true,
      side: DoubleSide2,
      depthWrite: false
    });
  }
  /**
   * Creates from the given shape path and array of shapes.
   *
   * @deprecated since 185.
   * @param {ShapePath} shapePath - The shape path.
   * @return {Array<Shape>} An array of shapes.
   */
  static createShapes(shapePath) {
    console.warn("SVGLoader: createShapes() is deprecated. Use shapePath.toShapes() instead.");
    return shapePath.toShapes();
  }
  /**
   * Returns a stroke style object from the given parameters.
   *
   * @param {number} [width=1] - The stroke width.
   * @param {string} [color='#000'] - The stroke color, as  returned by {@link Color#getStyle}.
   * @param {'round'|'bevel'|'miter'|'miter-limit'} [lineJoin='miter'] - The line join style.
   * @param {'round'|'square'|'butt'} [lineCap='butt'] - The line cap style.
   * @param {number} [miterLimit=4] - Maximum join length, in multiples of the `width` parameter (join is truncated if it exceeds that distance).
   * @return {Object} The style object.
   */
  static getStrokeStyle(width, color, lineJoin, lineCap, miterLimit) {
    width = width !== void 0 ? width : 1;
    color = color !== void 0 ? color : "#000";
    lineJoin = lineJoin !== void 0 ? lineJoin : "miter";
    lineCap = lineCap !== void 0 ? lineCap : "butt";
    miterLimit = miterLimit !== void 0 ? miterLimit : 4;
    return {
      strokeColor: color,
      strokeWidth: width,
      strokeLineJoin: lineJoin,
      strokeLineCap: lineCap,
      strokeMiterLimit: miterLimit
    };
  }
  /**
   * Creates a stroke from an array of points.
   *
   * @param {Array<Vector2>} points - The points in 2D space. Minimum 2 points. The path can be open or closed (last point equals to first point).
   * @param {Object} style - Object with SVG properties as returned by `SVGLoader.getStrokeStyle()`, or `SVGLoader.parse()` in the `path.userData.style` object.
   * @param {number} [arcDivisions=12] - Arc divisions for round joins and endcaps.
   * @param {number} [minDistance=0.001] - Points closer to this distance will be merged.
   * @return {?BufferGeometry} The stroke geometry. UV coordinates are generated ('u' along path. 'v' across it, from left to right).
   * Returns `null` if not geometry was generated.
   */
  static pointsToStroke(points, style, arcDivisions, minDistance) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    if (_SVGLoader.pointsToStrokeWithBuffers(points, style, arcDivisions, minDistance, vertices, normals, uvs) === 0) {
      return null;
    }
    const geometry = new BufferGeometry3();
    geometry.setAttribute("position", new Float32BufferAttribute2(vertices, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute2(normals, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute2(uvs, 2));
    return geometry;
  }
  /**
   * Creates a stroke from an array of points.
   *
   * @param {Array<Vector2>} points - The points in 2D space. Minimum 2 points.
   * @param {Object} style - Object with SVG properties as returned by `SVGLoader.getStrokeStyle()`, or `SVGLoader.parse()` in the `path.userData.style` object.
   * @param {number} [arcDivisions=12] - Arc divisions for round joins and endcaps.
   * @param {number} [minDistance=0.001] - Points closer to this distance will be merged.
   * @param {Array<number>} vertices - An array holding vertices.
   * @param {Array<number>} normals - An array holding normals.
   * @param {Array<number>} uvs - An array holding uvs.
   * @param {number} [vertexOffset=0] - The vertex offset.
   * @return {number} The number of vertices.
   */
  static pointsToStrokeWithBuffers(points, style, arcDivisions, minDistance, vertices, normals, uvs, vertexOffset) {
    const tempV2_1 = new Vector23();
    const tempV2_2 = new Vector23();
    const tempV2_3 = new Vector23();
    const tempV2_4 = new Vector23();
    const tempV2_5 = new Vector23();
    const tempV2_6 = new Vector23();
    const tempV2_7 = new Vector23();
    const lastPointL = new Vector23();
    const lastPointR = new Vector23();
    const point0L = new Vector23();
    const point0R = new Vector23();
    const currentPointL = new Vector23();
    const currentPointR = new Vector23();
    const nextPointL = new Vector23();
    const nextPointR = new Vector23();
    const innerPoint = new Vector23();
    const outerPoint = new Vector23();
    arcDivisions = arcDivisions !== void 0 ? arcDivisions : 12;
    minDistance = minDistance !== void 0 ? minDistance : 1e-3;
    vertexOffset = vertexOffset !== void 0 ? vertexOffset : 0;
    points = removeDuplicatedPoints(points);
    const numPoints = points.length;
    if (numPoints < 2) return 0;
    const isClosed = points[0].equals(points[numPoints - 1]);
    let currentPoint;
    let previousPoint = points[0];
    let nextPoint;
    const strokeWidth2 = style.strokeWidth / 2;
    const deltaU = 1 / (numPoints - 1);
    let u0 = 0, u1;
    let innerSideModified;
    let joinIsOnLeftSide;
    let isMiter;
    let initialJoinIsOnLeftSide = false;
    let numVertices = 0;
    let currentCoordinate = vertexOffset * 3;
    let currentCoordinateUV = vertexOffset * 2;
    getNormal(points[0], points[1], tempV2_1).multiplyScalar(strokeWidth2);
    lastPointL.copy(points[0]).sub(tempV2_1);
    lastPointR.copy(points[0]).add(tempV2_1);
    point0L.copy(lastPointL);
    point0R.copy(lastPointR);
    for (let iPoint = 1; iPoint < numPoints; iPoint++) {
      currentPoint = points[iPoint];
      if (iPoint === numPoints - 1) {
        if (isClosed) {
          nextPoint = points[1];
        } else nextPoint = void 0;
      } else {
        nextPoint = points[iPoint + 1];
      }
      const normal1 = tempV2_1;
      getNormal(previousPoint, currentPoint, normal1);
      tempV2_3.copy(normal1).multiplyScalar(strokeWidth2);
      currentPointL.copy(currentPoint).sub(tempV2_3);
      currentPointR.copy(currentPoint).add(tempV2_3);
      u1 = u0 + deltaU;
      innerSideModified = false;
      if (nextPoint !== void 0) {
        getNormal(currentPoint, nextPoint, tempV2_2);
        tempV2_3.copy(tempV2_2).multiplyScalar(strokeWidth2);
        nextPointL.copy(currentPoint).sub(tempV2_3);
        nextPointR.copy(currentPoint).add(tempV2_3);
        joinIsOnLeftSide = true;
        tempV2_3.subVectors(nextPoint, previousPoint);
        if (normal1.dot(tempV2_3) < 0) {
          joinIsOnLeftSide = false;
        }
        if (iPoint === 1) initialJoinIsOnLeftSide = joinIsOnLeftSide;
        tempV2_3.subVectors(nextPoint, currentPoint);
        tempV2_3.normalize();
        const dot = Math.abs(normal1.dot(tempV2_3));
        if (dot > Number.EPSILON) {
          const miterSide = strokeWidth2 / dot;
          tempV2_3.multiplyScalar(-miterSide);
          tempV2_4.subVectors(currentPoint, previousPoint);
          tempV2_5.copy(tempV2_4).setLength(miterSide).add(tempV2_3);
          innerPoint.copy(tempV2_5).negate();
          const miterLength2 = tempV2_5.length();
          const segmentLengthPrev = tempV2_4.length();
          tempV2_4.divideScalar(segmentLengthPrev);
          tempV2_6.subVectors(nextPoint, currentPoint);
          const segmentLengthNext = tempV2_6.length();
          tempV2_6.divideScalar(segmentLengthNext);
          if (tempV2_4.dot(innerPoint) < segmentLengthPrev && tempV2_6.dot(innerPoint) < segmentLengthNext) {
            innerSideModified = true;
          }
          outerPoint.copy(tempV2_5).add(currentPoint);
          innerPoint.add(currentPoint);
          if (innerSideModified) {
            const refPt = joinIsOnLeftSide ? lastPointR : lastPointL;
            const foldCross = (outerPoint.x - refPt.x) * (innerPoint.y - refPt.y) - (outerPoint.y - refPt.y) * (innerPoint.x - refPt.x);
            if (joinIsOnLeftSide && foldCross < 0 || !joinIsOnLeftSide && foldCross > 0) {
              innerPoint.copy(refPt);
            }
          }
          isMiter = false;
          if (innerSideModified) {
            if (joinIsOnLeftSide) {
              nextPointR.copy(innerPoint);
              currentPointR.copy(innerPoint);
            } else {
              nextPointL.copy(innerPoint);
              currentPointL.copy(innerPoint);
            }
          } else {
            makeSegmentTriangles();
          }
          switch (style.strokeLineJoin) {
            case "bevel":
              makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);
              break;
            case "round":
              createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);
              if (joinIsOnLeftSide) {
                makeCircularSector(currentPoint, currentPointL, nextPointL, u1, 0);
              } else {
                makeCircularSector(currentPoint, nextPointR, currentPointR, u1, 1);
              }
              break;
            case "miter":
            case "miter-clip":
            default:
              const miterFraction = strokeWidth2 * style.strokeMiterLimit / miterLength2;
              if (miterFraction < 1) {
                if (style.strokeLineJoin !== "miter-clip") {
                  makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);
                  break;
                } else {
                  createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);
                  if (joinIsOnLeftSide) {
                    tempV2_6.subVectors(outerPoint, currentPointL).multiplyScalar(miterFraction).add(currentPointL);
                    tempV2_7.subVectors(outerPoint, nextPointL).multiplyScalar(miterFraction).add(nextPointL);
                    addVertex(currentPointL, u1, 0);
                    addVertex(tempV2_6, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_6, u1, 0);
                    addVertex(tempV2_7, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_7, u1, 0);
                    addVertex(nextPointL, u1, 0);
                  } else {
                    tempV2_6.subVectors(outerPoint, currentPointR).multiplyScalar(miterFraction).add(currentPointR);
                    tempV2_7.subVectors(outerPoint, nextPointR).multiplyScalar(miterFraction).add(nextPointR);
                    addVertex(currentPointR, u1, 1);
                    addVertex(tempV2_6, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_6, u1, 1);
                    addVertex(tempV2_7, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(tempV2_7, u1, 1);
                    addVertex(nextPointR, u1, 1);
                  }
                }
              } else {
                if (innerSideModified) {
                  if (joinIsOnLeftSide) {
                    addVertex(lastPointR, u0, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(outerPoint, u1, 0);
                    addVertex(lastPointR, u0, 1);
                    addVertex(outerPoint, u1, 0);
                    addVertex(innerPoint, u1, 1);
                  } else {
                    addVertex(lastPointR, u0, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(outerPoint, u1, 1);
                    addVertex(lastPointL, u0, 0);
                    addVertex(innerPoint, u1, 0);
                    addVertex(outerPoint, u1, 1);
                  }
                  if (joinIsOnLeftSide) {
                    nextPointL.copy(outerPoint);
                  } else {
                    nextPointR.copy(outerPoint);
                  }
                } else {
                  if (joinIsOnLeftSide) {
                    addVertex(currentPointL, u1, 0);
                    addVertex(outerPoint, u1, 0);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(outerPoint, u1, 0);
                    addVertex(nextPointL, u1, 0);
                  } else {
                    addVertex(currentPointR, u1, 1);
                    addVertex(outerPoint, u1, 1);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(currentPoint, u1, 0.5);
                    addVertex(outerPoint, u1, 1);
                    addVertex(nextPointR, u1, 1);
                  }
                }
                isMiter = true;
              }
              break;
          }
        } else {
          makeSegmentTriangles();
        }
      } else {
        makeSegmentTriangles();
      }
      if (!isClosed && iPoint === numPoints - 1) {
        addCapGeometry(points[0], point0L, point0R, joinIsOnLeftSide, true, u0);
      }
      u0 = u1;
      previousPoint = currentPoint;
      lastPointL.copy(nextPointL);
      lastPointR.copy(nextPointR);
    }
    if (!isClosed) {
      addCapGeometry(currentPoint, currentPointL, currentPointR, joinIsOnLeftSide, false, u1);
    } else if (innerSideModified && vertices) {
      let lastOuter = outerPoint;
      let lastInner = innerPoint;
      if (initialJoinIsOnLeftSide !== joinIsOnLeftSide) {
        lastOuter = innerPoint;
        lastInner = outerPoint;
      }
      if (joinIsOnLeftSide) {
        if (isMiter || initialJoinIsOnLeftSide) {
          lastInner.toArray(vertices, 0 * 3);
          lastInner.toArray(vertices, 3 * 3);
          if (isMiter) {
            lastOuter.toArray(vertices, 1 * 3);
          }
        }
      } else {
        if (isMiter || !initialJoinIsOnLeftSide) {
          lastInner.toArray(vertices, 1 * 3);
          lastInner.toArray(vertices, 3 * 3);
          if (isMiter) {
            lastOuter.toArray(vertices, 0 * 3);
          }
        }
      }
    }
    if (vertices) {
      const tri = [new Vector23(), new Vector23(), new Vector23()];
      const startFloat = vertexOffset * 3;
      for (let t = startFloat; t < currentCoordinate; t += 9) {
        tri[0].set(vertices[t], vertices[t + 1]);
        tri[1].set(vertices[t + 3], vertices[t + 4]);
        tri[2].set(vertices[t + 6], vertices[t + 7]);
        if (ShapeUtils.area(tri) < 0) {
          vertices[t + 3] = tri[0].x;
          vertices[t + 4] = tri[0].y;
        }
      }
    }
    return numVertices;
    function getNormal(p1, p2, result) {
      result.subVectors(p2, p1);
      return result.set(-result.y, result.x).normalize();
    }
    function addVertex(position, u, v) {
      if (vertices) {
        vertices[currentCoordinate] = position.x;
        vertices[currentCoordinate + 1] = position.y;
        vertices[currentCoordinate + 2] = 0;
        if (normals) {
          normals[currentCoordinate] = 0;
          normals[currentCoordinate + 1] = 0;
          normals[currentCoordinate + 2] = 1;
        }
        currentCoordinate += 3;
        if (uvs) {
          uvs[currentCoordinateUV] = u;
          uvs[currentCoordinateUV + 1] = v;
          currentCoordinateUV += 2;
        }
      }
      numVertices += 3;
    }
    function makeCircularSector(center, p1, p2, u, v) {
      tempV2_1.copy(p1).sub(center).normalize();
      tempV2_2.copy(p2).sub(center).normalize();
      let angle = Math.PI;
      const dot = tempV2_1.dot(tempV2_2);
      if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));
      angle /= arcDivisions;
      tempV2_3.copy(p1);
      for (let i = 0, il = arcDivisions - 1; i < il; i++) {
        tempV2_4.copy(tempV2_3).rotateAround(center, angle);
        addVertex(tempV2_3, u, v);
        addVertex(tempV2_4, u, v);
        addVertex(center, u, 0.5);
        tempV2_3.copy(tempV2_4);
      }
      addVertex(tempV2_3, u, v);
      addVertex(p2, u, v);
      addVertex(center, u, 0.5);
    }
    function makeSegmentTriangles() {
      addVertex(lastPointR, u0, 1);
      addVertex(lastPointL, u0, 0);
      addVertex(currentPointL, u1, 0);
      addVertex(lastPointR, u0, 1);
      addVertex(currentPointL, u1, 0);
      addVertex(currentPointR, u1, 1);
    }
    function makeSegmentWithBevelJoin(joinIsOnLeftSide2, innerSideModified2, u) {
      if (innerSideModified2) {
        if (joinIsOnLeftSide2) {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointL, u1, 0);
          addVertex(lastPointR, u0, 1);
          addVertex(currentPointL, u1, 0);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPointL, u, 0);
          addVertex(nextPointL, u, 0);
          addVertex(innerPoint, u, 0.5);
        } else {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(currentPointR, u, 1);
          addVertex(innerPoint, u, 0);
          addVertex(nextPointR, u, 1);
        }
      } else {
        if (joinIsOnLeftSide2) {
          addVertex(currentPointL, u, 0);
          addVertex(nextPointL, u, 0);
          addVertex(currentPoint, u, 0.5);
        } else {
          addVertex(currentPointR, u, 1);
          addVertex(nextPointR, u, 0);
          addVertex(currentPoint, u, 0.5);
        }
      }
    }
    function createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide2, innerSideModified2) {
      if (innerSideModified2) {
        if (joinIsOnLeftSide2) {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointL, u1, 0);
          addVertex(lastPointR, u0, 1);
          addVertex(currentPointL, u1, 0);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPointL, u0, 0);
          addVertex(currentPoint, u1, 0.5);
          addVertex(innerPoint, u1, 1);
          addVertex(currentPoint, u1, 0.5);
          addVertex(nextPointL, u0, 0);
          addVertex(innerPoint, u1, 1);
        } else {
          addVertex(lastPointR, u0, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(lastPointL, u0, 0);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPointR, u1, 1);
          addVertex(currentPointR, u0, 1);
          addVertex(innerPoint, u1, 0);
          addVertex(currentPoint, u1, 0.5);
          addVertex(currentPoint, u1, 0.5);
          addVertex(innerPoint, u1, 0);
          addVertex(nextPointR, u0, 1);
        }
      }
    }
    function addCapGeometry(center, p1, p2, joinIsOnLeftSide2, start, u) {
      switch (style.strokeLineCap) {
        case "round":
          if (start) {
            makeCircularSector(center, p2, p1, u, 0.5);
          } else {
            makeCircularSector(center, p1, p2, u, 0.5);
          }
          break;
        case "square":
          if (start) {
            tempV2_1.subVectors(p1, center);
            tempV2_2.set(tempV2_1.y, -tempV2_1.x);
            tempV2_3.addVectors(tempV2_1, tempV2_2).add(center);
            tempV2_4.subVectors(tempV2_2, tempV2_1).add(center);
            if (joinIsOnLeftSide2) {
              tempV2_3.toArray(vertices, 1 * 3);
              tempV2_4.toArray(vertices, 0 * 3);
              tempV2_4.toArray(vertices, 3 * 3);
            } else {
              tempV2_3.toArray(vertices, 1 * 3);
              uvs[3 * 2 + 1] === 1 ? tempV2_4.toArray(vertices, 3 * 3) : tempV2_3.toArray(vertices, 3 * 3);
              tempV2_4.toArray(vertices, 0 * 3);
            }
          } else {
            tempV2_1.subVectors(p2, center);
            tempV2_2.set(tempV2_1.y, -tempV2_1.x);
            tempV2_3.addVectors(tempV2_1, tempV2_2).add(center);
            tempV2_4.subVectors(tempV2_2, tempV2_1).add(center);
            const vl = vertices.length;
            if (joinIsOnLeftSide2) {
              tempV2_3.toArray(vertices, vl - 1 * 3);
              tempV2_4.toArray(vertices, vl - 2 * 3);
              tempV2_4.toArray(vertices, vl - 4 * 3);
            } else {
              tempV2_4.toArray(vertices, vl - 2 * 3);
              tempV2_3.toArray(vertices, vl - 1 * 3);
              tempV2_4.toArray(vertices, vl - 4 * 3);
            }
          }
          break;
        case "butt":
        default:
          break;
      }
    }
    function removeDuplicatedPoints(points2) {
      let dupPoints = false;
      for (let i = 1, n = points2.length - 1; i < n; i++) {
        if (points2[i].distanceTo(points2[i + 1]) < minDistance) {
          dupPoints = true;
          break;
        }
      }
      if (!dupPoints) return points2;
      const newPoints = [];
      newPoints.push(points2[0]);
      for (let i = 1, n = points2.length - 1; i < n; i++) {
        if (points2[i].distanceTo(points2[i + 1]) >= minDistance) {
          newPoints.push(points2[i]);
        }
      }
      newPoints.push(points2[points2.length - 1]);
      return newPoints;
    }
  }
};
var GRADIENT_URL_RE = /^\s*url\(\s*(?:["']\s*)?#([^)'"\s]+)(?:\s*["'])?\s*\)\s*$/;
function buildGradientTexture(gradient, shapePath, resolution = 256) {
  if (!gradient || !Array.isArray(gradient.stops) || gradient.stops.length === 0) return null;
  const worldTransform = shapePath.userData.transform;
  const isBBoxUnits = gradient.gradientUnits === "objectBoundingBox";
  let localBBox = null;
  if (isBBoxUnits) {
    localBBox = computeLocalBBox(shapePath, worldTransform);
    if (localBBox === null) return null;
  }
  function resolvePoint(x, y, out) {
    out.set(x, y, 1);
    if (gradient.gradientTransform) out.applyMatrix3(gradient.gradientTransform);
    if (isBBoxUnits) out.set(
      localBBox.minX + out.x * localBBox.width,
      localBBox.minY + out.y * localBBox.height,
      1
    );
    if (worldTransform) out.applyMatrix3(worldTransform);
  }
  const canvas = document.createElement("canvas");
  let textureMatrix;
  if (gradient.type === "linearGradient") {
    canvas.width = resolution;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, resolution, 0);
    addStops(grad, gradient.stops);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, resolution, 1);
    const p1 = new Vector35();
    const p2 = new Vector35();
    resolvePoint(gradient.x1, gradient.y1, p1);
    resolvePoint(gradient.x2, gradient.y2, p2);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len2 = dx * dx + dy * dy || 1e-20;
    const a = dx / len2;
    const b = dy / len2;
    const c = -(a * p1.x + b * p1.y);
    textureMatrix = new Matrix3().set(
      a,
      b,
      c,
      0,
      0,
      0.5,
      0,
      0,
      1
    );
  } else {
    let cx = gradient.cx, cy = gradient.cy;
    let fx = gradient.fx, fy = gradient.fy;
    let r = gradient.r;
    if (gradient.gradientTransform) {
      const tmp = new Vector35();
      tmp.set(cx, cy, 1).applyMatrix3(gradient.gradientTransform);
      cx = tmp.x;
      cy = tmp.y;
      tmp.set(fx, fy, 1).applyMatrix3(gradient.gradientTransform);
      fx = tmp.x;
      fy = tmp.y;
    }
    if (isBBoxUnits) {
      cx = localBBox.minX + cx * localBBox.width;
      cy = localBBox.minY + cy * localBBox.height;
      fx = localBBox.minX + fx * localBBox.width;
      fy = localBBox.minY + fy * localBBox.height;
      r = r * Math.sqrt((localBBox.width * localBBox.width + localBBox.height * localBBox.height) / 2);
    }
    if (r <= 0) return null;
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    const localMinX = cx - r;
    const localMinY = cy - r;
    const localSpan = 2 * r;
    const scale = resolution / localSpan;
    ctx.setTransform(scale, 0, 0, scale, -localMinX * scale, -localMinY * scale);
    const grad = ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
    addStops(grad, gradient.stops);
    ctx.fillStyle = grad;
    ctx.fillRect(localMinX, localMinY, localSpan, localSpan);
    const inv = worldTransform ? worldTransform.clone().invert() : new Matrix3();
    const norm = new Matrix3().set(
      1 / localSpan,
      0,
      -localMinX / localSpan,
      0,
      1 / localSpan,
      -localMinY / localSpan,
      0,
      0,
      1
    );
    textureMatrix = norm.multiply(inv);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = COLOR_SPACE_SVG;
  texture.flipY = false;
  texture.matrixAutoUpdate = false;
  texture.matrix = textureMatrix;
  const wrap = gradient.spreadMethod === "reflect" ? MirroredRepeatWrapping2 : gradient.spreadMethod === "repeat" ? RepeatWrapping2 : ClampToEdgeWrapping2;
  texture.wrapS = wrap;
  texture.wrapT = wrap;
  return texture;
}
function computeLocalBBox(shapePath, worldTransform) {
  const inv = worldTransform ? worldTransform.clone().invert() : null;
  const tmp = new Vector23();
  const box = new Box2();
  for (const subPath of shapePath.subPaths) {
    for (const p of subPath.getPoints()) {
      tmp.copy(p);
      if (inv) tmp.applyMatrix3(inv);
      box.expandByPoint(tmp);
    }
  }
  if (box.isEmpty()) return null;
  return { minX: box.min.x, minY: box.min.y, width: box.max.x - box.min.x, height: box.max.y - box.min.y };
}
function addStops(canvasGradient, stops) {
  const tmpColor = new Color2();
  for (const stop of stops) {
    let css = stop.color;
    if (stop.opacity < 1) {
      tmpColor.setStyle(stop.color, COLOR_SPACE_SVG);
      const m = /rgb\(([^)]+)\)/.exec(tmpColor.getStyle(COLOR_SPACE_SVG));
      if (m) css = `rgba(${m[1]},${stop.opacity})`;
    }
    canvasGradient.addColorStop(Math.max(0, Math.min(1, stop.offset)), css);
  }
}

// portfolio/assets/hyb26-model/source/badge-display-overlay.ts
import { Matrix4 as Matrix43, Vector3 as Vector36 } from "../vendor/three/three.module.js";
function displayOverlayMatrix(mesh, camera, width, height, rotated) {
  const bounds = mesh.geometry.boundingBox;
  const eye = camera.getWorldPosition(new Vector36()).applyMatrix4(mesh.matrixWorld.clone().invert());
  if (eye.z <= bounds.max.z) return null;
  const size = bounds.getSize(new Vector36());
  const direction = rotated ? -1 : 1;
  const local = new Matrix43().set(
    direction * size.x / 640,
    0,
    0,
    rotated ? bounds.max.x : bounds.min.x,
    0,
    -direction * size.y / 438,
    0,
    rotated ? bounds.min.y : bounds.max.y,
    0,
    0,
    1,
    bounds.max.z,
    0,
    0,
    0,
    1
  );
  const matrix = new Matrix43().set(
    width / 2,
    0,
    0,
    width / 2,
    0,
    -height / 2,
    0,
    height / 2,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(mesh.matrixWorld).multiply(local);
  const values = matrix.elements;
  const w = values[3] * 320 + values[7] * 219 + values[15];
  if (w <= 0) return null;
  matrix.multiplyScalar(1 / w);
  values[2] = values[6] = values[8] = values[9] = values[11] = values[14] = 0;
  values[10] = 1;
  return matrix;
}

// portfolio/assets/hyb26-model/source/badge-model-idle-rotation.ts
function initBadgeIdleRotation(host, rotate) {
  const abort = new AbortController();
  const { signal } = abort;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointers = /* @__PURE__ */ new Set();
  const keys = /* @__PURE__ */ new Set();
  let hovering = host.matches(":hover");
  let visible = true;
  let modalOpen = false;
  let idleUntil = 0;
  let frame = 0;
  let timer;
  let previous;
  const blocked = () => signal.aborted || document.hidden || !visible || motion.matches || hovering || modalOpen || pointers.size > 0 || keys.size > 0;
  const tick = (now) => {
    frame = 0;
    if (blocked()) return;
    if (previous !== void 0) rotate(Math.min((now - previous) / 1e3, 0.1));
    previous = now;
    frame = requestAnimationFrame(tick);
  };
  function schedule() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    frame = 0;
    previous = void 0;
    if (blocked()) return;
    const remaining = idleUntil - performance.now();
    if (remaining > 0) timer = setTimeout(schedule, remaining);
    else frame = requestAnimationFrame(tick);
  }
  const activity = () => {
    idleUntil = performance.now() + 3e4;
    schedule();
  };
  host.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hovering = true;
    activity();
  }, { signal });
  host.addEventListener("pointerleave", () => {
    hovering = false;
    activity();
  }, { signal });
  host.addEventListener("pointermove", activity, { signal });
  document.addEventListener("pointerdown", (event) => {
    pointers.add(event.pointerId);
    activity();
  }, { signal, capture: true });
  const release = (event) => {
    pointers.delete(event.pointerId);
    activity();
  };
  window.addEventListener("pointerup", release, { signal, capture: true });
  window.addEventListener("pointercancel", release, { signal, capture: true });
  window.addEventListener("keydown", (event) => {
    if (!event.isTrusted) return;
    keys.add(event.code);
    activity();
  }, { signal, capture: true });
  window.addEventListener("keyup", (event) => {
    if (!event.isTrusted) return;
    keys.delete(event.code);
    activity();
  }, { signal, capture: true });
  document.addEventListener("wheel", activity, { signal, passive: true });
  window.addEventListener("blur", () => {
    pointers.clear();
    keys.clear();
    hovering = false;
    activity();
  }, { signal });
  document.addEventListener("visibilitychange", activity, { signal });
  document.addEventListener("document-viewer:open", () => {
    modalOpen = true;
    activity();
  }, { signal });
  document.addEventListener("document-viewer:close", () => {
    modalOpen = false;
    activity();
  }, { signal });
  motion.addEventListener("change", activity, { signal });
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    schedule();
  });
  observer.observe(host);
  schedule();
  return {
    dispose() {
      abort.abort();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
    }
  };
}

// portfolio/assets/hyb26-model/source/badge-editor-model.ts
var BOARD_CORNER_RADIUS = 37e-4;
var padTexture = { width: 422, height: 534 };
var touchPads = [
  { bit: 1024, shape: "circle", x0: 94, y0: 402, x1: 141, y1: 448 },
  { bit: 8192, shape: "circle", x0: 50, y0: 446, x1: 96, y1: 493 },
  { bit: 2048, shape: "box", x0: 297, y0: 403, x1: 333, y1: 439 },
  { bit: 256, shape: "box", x0: 262, y0: 439, x1: 298, y1: 475 },
  { bit: 512, shape: "box", x0: 332, y0: 439, x1: 368, y1: 475 },
  { bit: 4096, shape: "box", x0: 297, y0: 474, x1: 333, y1: 510 },
  { bit: 16384, shape: "pill", x0: 161, y0: 471, x1: 192, y1: 502 },
  { bit: 32, shape: "pill", x0: 196, y0: 471, x1: 227, y1: 502 }
];
function touchPadAt(u, v) {
  const x = u * padTexture.width;
  const y = v * padTexture.height;
  return touchPads.find((pad) => x >= pad.x0 && x <= pad.x1 && y >= pad.y0 && y <= pad.y1)?.bit ?? 0;
}
var zoomStep = 0.05;
function initBadgeModel(host, screen, button, signal, onError, elements) {
  const display = document.createElement("canvas");
  display.width = 640;
  display.height = 438;
  const displayContext = display.getContext("2d");
  if (!displayContext) throw new Error("Canvas rendering is unavailable.");
  const context = displayContext;
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace3;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", elements?.canvasLabel ?? "Interactive 3D badge. Drag to rotate, scroll to zoom. Arrow keys control the badge, Space selects. WASD and J control the gamepad.");
  host.append(canvas);
  const displayOverlay = elements?.displayOverlay;
  const scene = new Scene();
  const camera = new PerspectiveCamera2(35, 1, 1e-3, 2);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 0.025;
  controls.maxDistance = 0.6;
  scene.add(new HemisphereLight(16777215, 3158064, 2.5));
  const key = new DirectionalLight2(16777215, 3);
  key.position.set(-0.1, 0.15, 0.3);
  scene.add(key);
  const fill = new DirectionalLight2(16777215, 1.5);
  fill.position.set(0.2, -0.1, -0.2);
  scene.add(fill);
  const texture = new CanvasTexture2(display);
  texture.colorSpace = SRGBColorSpace3;
  texture.flipY = false;
  texture.magFilter = NearestFilter2;
  texture.minFilter = LinearFilter2;
  texture.generateMipmaps = false;
  const displayMaterial = new MeshBasicMaterial3({ map: texture, side: DoubleSide3, toneMapped: false, transparent: true, depthWrite: false });
  const raycaster = new Raycaster();
  const pointer = new Vector24();
  const targets = /* @__PURE__ */ new Map();
  const caps = /* @__PURE__ */ new Map();
  const discarded = /* @__PURE__ */ new Set();
  const screenButton = elements?.screen ?? document.getElementById("focus-badge-screen");
  const fullButton = elements?.full ?? document.getElementById("focus-badge-full");
  const status = elements?.status ?? document.getElementById("model-status");
  let model;
  let displayMesh;
  let artwork;
  let padMask = 0;
  const active = /* @__PURE__ */ new Map();
  let mask = 0;
  let frame = 0;
  let disposed = false;
  let screenView = screenButton.getAttribute("aria-pressed") === "true";
  let rotated = false;
  let displayRotated = false;
  const pose = { pitch: 0, roll: 0, yaw: 0 };
  let idleRotation;
  let baseDistance = 0;
  let rendered = 0;
  let zoomReporting = false;
  function render() {
    if (disposed || frame || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed) return;
      try {
        renderer.render(scene, camera);
        rendered += 1;
        renderOverlay();
      } catch (error) {
        onError(error);
      }
    });
  }
  function renderOverlay() {
    if (!displayOverlay || !displayMesh || displayOverlay.hidden) return;
    const matrix = displayOverlayMatrix(displayMesh, camera, host.clientWidth, host.clientHeight, displayRotated);
    displayOverlay.style.visibility = matrix ? "visible" : "hidden";
    if (matrix) displayOverlay.style.transform = `matrix3d(${matrix.elements.join(",")})`;
  }
  function updateFrame() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, display.width, display.height);
    context.imageSmoothingEnabled = false;
    context.save();
    if (displayRotated) {
      context.translate(display.width, display.height);
      context.rotate(Math.PI);
    }
    if (elements?.displayFit === "stretch") {
      context.drawImage(screen, 0, 0, display.width, display.height);
    } else {
      const scale = Math.min(display.width / screen.width, display.height / screen.height);
      context.drawImage(screen, (display.width - screen.width * scale) / 2, (display.height - screen.height * scale) / 2, screen.width * scale, screen.height * scale);
    }
    context.restore();
    texture.needsUpdate = true;
    render();
  }
  function paintPads() {
    if (!artwork) return;
    const pressed = touchPads.reduce((bits, pad) => bits | mask & pad.bit, 0);
    if (pressed === padMask) return;
    padMask = pressed;
    const { canvas: art, source } = artwork;
    const paint = art.getContext("2d");
    if (!paint) return;
    paint.drawImage(source, 0, 0, art.width, art.height);
    paint.save();
    paint.scale(art.width / padTexture.width, art.height / padTexture.height);
    paint.globalAlpha = 0.6;
    paint.fillStyle = paint.strokeStyle = "#5fed83";
    paint.lineCap = "round";
    paint.lineWidth = 13;
    for (const pad of touchPads) {
      if (!(pressed & pad.bit)) continue;
      paint.beginPath();
      if (pad.shape === "box") paint.fillRect(pad.x0, pad.y0, pad.x1 - pad.x0, pad.y1 - pad.y0);
      else if (pad.shape === "circle") {
        paint.arc((pad.x0 + pad.x1) / 2, (pad.y0 + pad.y1) / 2, (pad.x1 - pad.x0) / 2, 0, Math.PI * 2);
        paint.fill();
      } else {
        paint.moveTo(pad.x0 + 6, pad.y1 - 6);
        paint.lineTo(pad.x1 - 6, pad.y0 + 6);
        paint.stroke();
      }
    }
    paint.restore();
    artwork.texture.needsUpdate = true;
  }
  function setButtons(value) {
    mask = value;
    for (const [bit, cap] of caps) {
      const pressed = Boolean(value & bit);
      cap.mesh.position.z = cap.z - (pressed ? 12e-4 : 0);
      cap.material.emissive.setHex(pressed ? 6286723 : 0);
      cap.material.emissiveIntensity = pressed ? 0.6 : 0;
    }
    paintPads();
    render();
  }
  function zoom(direction) {
    if (!model) return;
    const offset = camera.position.clone().sub(controls.target);
    const distance = Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length() * (direction > 0 ? 1 - zoomStep : 1 / (1 - zoomStep))));
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
    render();
  }
  const zoomIn = () => zoom(1);
  const zoomOut = () => zoom(-1);
  function framing(object, margin) {
    const bounds = new Box32().setFromObject(object);
    const size = bounds.getSize(new Vector37());
    const distance = Math.max(size.y, size.x / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360)) * margin;
    return { center: bounds.getCenter(new Vector37()), distance };
  }
  let focusing = false;
  function focusZoom() {
    if (focusing || !model || !displayMesh) return;
    const whole = framing(model, 1.12);
    const close = framing(displayMesh, 1.25);
    const distance = camera.position.distanceTo(controls.target);
    const t = Math.min(1, Math.max(0, (distance - close.distance) / (whole.distance - close.distance)));
    const shift = close.center.lerp(whole.center, t).sub(controls.target);
    if (shift.lengthSq() < 1e-12) return;
    focusing = true;
    controls.target.add(shift);
    camera.position.add(shift);
    controls.update();
    focusing = false;
  }
  function view() {
    if (!model) return;
    const { center, distance } = framing(screenView && displayMesh ? displayMesh : model, screenView ? 1.25 : 1.12);
    controls.target.copy(center);
    const angled = elements?.idleRotation && !screenView;
    camera.position.copy(center).add(new Vector37(screenView ? 0 : distance * (angled ? 0.2 : 0.04), screenView ? 0 : distance * (angled ? 0.08 : 0.02), distance));
    controls.update();
    render();
  }
  const setView = (value) => {
    screenView = value;
    screenButton.setAttribute("aria-pressed", String(value));
    fullButton?.setAttribute("aria-pressed", String(!value));
    view();
  };
  const focusScreen = () => setView(true);
  const showFull = () => setView(false);
  function applyRotation() {
    if (!model) return;
    const before = new Box32().setFromObject(model).getCenter(new Vector37());
    const radians = Math.PI / 180;
    model.rotation.set(pose.pitch * radians, pose.yaw * radians, pose.roll * radians + (rotated ? Math.PI : 0), "XYZ");
    model.updateMatrixWorld(true);
    model.position.add(before.sub(new Box32().setFromObject(model).getCenter(new Vector37())));
    model.updateMatrixWorld(true);
    if (screenView) view();
    else {
      focusZoom();
      controls.update();
      render();
    }
  }
  function setRotated(value) {
    if (value === rotated) return;
    rotated = value;
    applyRotation();
  }
  function setDisplayRotated(value) {
    if (value === displayRotated) return;
    displayRotated = value;
    updateFrame();
  }
  function setPose(pitch, roll, yaw) {
    if (![pitch, roll, yaw].every(Number.isFinite)) return;
    Object.assign(pose, { pitch, roll, yaw });
    applyRotation();
  }
  const resize = new ResizeObserver(() => {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    try {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      render();
    } catch (error) {
      onError(error);
    }
  });
  resize.observe(host);
  const hit = (event) => {
    if (!model) return 0;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    model.updateMatrixWorld(true);
    const first = raycaster.intersectObject(model, true).find((hit2) => {
      const mesh = hit2.object;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      return mesh.visible && materials.some((material) => material && material.opacity >= 0.5);
    });
    if (!first) return 0;
    const target = targets.get(first.object);
    if (target) return target;
    return artwork && first.object === artwork.mesh && first.uv ? touchPadAt(first.uv.x, first.uv.y) : 0;
  };
  const down = (event) => {
    canvas.focus({ preventScroll: true });
    if (event.button !== 0 || active.has(event.pointerId)) return;
    const bit = hit(event);
    if (!bit) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    controls.enabled = false;
    active.set(event.pointerId, bit);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
    }
    button(bit, true);
  };
  const release = (pointer2) => {
    const pointers = pointer2 === void 0 ? [...active.keys()] : [pointer2];
    for (const id of pointers) {
      const bit = active.get(id);
      if (!bit) continue;
      active.delete(id);
      button(bit, false);
      if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    }
    if (!active.size) controls.enabled = true;
  };
  const up = (event) => {
    if (!active.has(event.pointerId)) return;
    event.stopImmediatePropagation();
    release(event.pointerId);
  };
  const move = (event) => {
    canvas.style.cursor = active.size || hit(event) ? "pointer" : "grab";
  };
  const lost = (event) => {
    event.preventDefault();
    onError(new Error("The browser lost its 3D graphics context."));
  };
  canvas.addEventListener("pointerdown", down, true);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up, true);
  canvas.addEventListener("pointercancel", up, true);
  const lostCapture = (event) => release(event.pointerId);
  canvas.addEventListener("lostpointercapture", lostCapture);
  canvas.addEventListener("webglcontextlost", lost);
  const releaseAll = () => release();
  window.addEventListener("blur", releaseAll);
  document.addEventListener("visibilitychange", releaseAll);
  controls.addEventListener("change", focusZoom);
  controls.addEventListener("change", render);
  const orbitStart = () => elements?.onOrbitStart?.();
  const reportZoom = () => {
    if (!baseDistance || zoomReporting) return;
    zoomReporting = true;
    try {
      elements?.onZoomChange?.(baseDistance / camera.position.distanceTo(controls.target));
    } finally {
      zoomReporting = false;
    }
  };
  controls.addEventListener("start", orbitStart);
  controls.addEventListener("change", reportZoom);
  screenButton.addEventListener("click", focusScreen);
  fullButton?.addEventListener("click", showFull);
  elements?.zoomIn?.addEventListener("click", zoomIn);
  elements?.zoomOut?.addEventListener("click", zoomOut);
  const modelURL = new URL(elements?.modelURL ?? "./github-mona-badge.glb", import.meta.url);
  const ready = fetch(modelURL, { signal, credentials: "omit" }).then(async (response) => {
    if (!response.ok) throw new Error(`Could not load the badge model (HTTP ${response.status}).`);
    const data = await response.arrayBuffer();
    signal.throwIfAborted();
    return new GLTFLoader().parseAsync(data, new URL("./", modelURL).href);
  }).then((gltf) => {
    model = gltf.scene;
    scene.add(model);
    model.traverse((object) => {
      if (!(object instanceof Mesh2)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (materials.some((material) => material.name === "MONA OS display bright pixel graphics")) {
        materials.forEach((material) => discarded.add(material));
        object.material = displayMaterial;
        object.renderOrder = 10;
        displayMesh = object;
        if (displayOverlay) {
          object.geometry.computeBoundingBox();
          host.append(displayOverlay);
        }
      }
      if (materials.some((material) => material.transparent)) materials.forEach((material) => {
        material.depthWrite = false;
      });
      const art = materials[0];
      if (art.name === "front_top" && art.map?.image && !artwork) {
        const source = art.map.image;
        const canvas2 = document.createElement("canvas");
        canvas2.width = source.width;
        canvas2.height = source.height;
        canvas2.getContext("2d")?.drawImage(source, 0, 0);
        const texture2 = new CanvasTexture2(canvas2);
        texture2.colorSpace = SRGBColorSpace3;
        texture2.flipY = art.map.flipY;
        texture2.wrapS = art.map.wrapS;
        texture2.wrapT = art.map.wrapT;
        texture2.anisotropy = art.map.anisotropy;
        texture2.channel = art.map.channel;
        art.map.dispose();
        art.map = texture2;
        artwork = { mesh: object, material: art, source, canvas: canvas2, texture: texture2 };
      }
      const match = object.name.match(/Black_tactile_control_(left|middle|right|up|down)$/);
      if (match) {
        const bit = { left: 16, middle: 8, right: 4, up: 2, down: 1 }[match[1]];
        const material = materials[0].clone();
        materials.forEach((material2) => discarded.add(material2));
        object.material = material;
        caps.set(bit, { mesh: object, z: object.position.z, material });
        targets.set(object, bit);
        const collar = model.getObjectByName(object.name.replace("Black_tactile_control", "Metal_button_collar"));
        if (collar) targets.set(collar, bit);
      }
    });
    if (!displayMesh || caps.size !== 5) throw new Error("The badge model is missing its screen or controls.");
    roundPanels(model);
    addControlSymbols(model);
    if (disposed) {
      disposeModel();
      return;
    }
    updateFrame();
    setButtons(mask);
    view();
    baseDistance = camera.position.distanceTo(controls.target);
    controls.minDistance = baseDistance / 1.45;
    controls.maxDistance = baseDistance / 0.7;
    if (rotated || pose.pitch || pose.roll || pose.yaw) applyRotation();
    renderer.render(scene, camera);
    renderOverlay();
    if (disposed || signal.aborted) return;
    host.dataset.state = "ready";
    status.hidden = true;
    screenButton.disabled = false;
    if (fullButton) fullButton.disabled = false;
    if (elements?.zoomIn) elements.zoomIn.disabled = false;
    if (elements?.zoomOut) elements.zoomOut.disabled = false;
    if (elements?.capture) {
      const target = controls.target.clone();
      const offset = camera.position.clone().sub(target);
      const capture = (event) => {
        const { angle } = event.detail;
        if (!Number.isFinite(angle)) throw new Error("Capture angle must be finite.");
        controls.target.copy(target);
        camera.position.copy(offset).applyAxisAngle(camera.up, angle).add(target);
        controls.update();
        updateFrame();
        cancelAnimationFrame(frame);
        frame = 0;
        renderer.render(scene, camera);
      };
      host.addEventListener("badge:capture", capture, { signal });
      host.dataset.captureReady = "true";
    } else if (elements?.idleRotation) {
      idleRotation = initBadgeIdleRotation(host, (seconds) => {
        camera.position.sub(controls.target).applyAxisAngle(camera.up, seconds * 0.06).add(controls.target);
        controls.update();
        render();
      });
    }
  });
  function roundPanels(root) {
    const board = root.getObjectByName("Inside_violet_circuit_board");
    if (!board) return;
    const outline = new Box32().setFromObject(board);
    for (const name of ["Front_electronic_assembly_face", "Back_electronics_silkscreen_print"]) {
      const panel = root.getObjectByName(name);
      if (!(panel instanceof Mesh2) || Array.isArray(panel.material)) continue;
      const bounds = new Box32().setFromObject(panel);
      const width = bounds.max.x - bounds.min.x;
      const height = bounds.max.y - bounds.min.y;
      const mask2 = document.createElement("canvas");
      mask2.width = 1024;
      mask2.height = Math.round(1024 * height / width);
      const scale = mask2.width / width;
      const draw = mask2.getContext("2d");
      if (!draw) continue;
      draw.fillStyle = "#000";
      draw.fillRect(0, 0, mask2.width, mask2.height);
      draw.fillStyle = "#fff";
      draw.beginPath();
      draw.roundRect((outline.min.x - bounds.min.x) * scale, (bounds.max.y - outline.max.y) * scale, (outline.max.x - outline.min.x) * scale, (outline.max.y - outline.min.y) * scale, BOARD_CORNER_RADIUS * scale);
      draw.fill();
      const alphaMap = new CanvasTexture2(mask2);
      alphaMap.flipY = false;
      const material = panel.material;
      material.alphaMap = alphaMap;
      material.alphaTest = 0.5;
      material.needsUpdate = true;
    }
  }
  function addControlSymbols(root) {
    const front = root.getObjectByName("Front_electronic_assembly_face");
    const sources = host.querySelectorAll("[data-badge-symbol]");
    if (!front || !artwork || sources.length !== 6) throw new Error("The badge model is missing its control symbols.");
    const frontBounds = new Box32().setFromObject(front);
    const artBounds = new Box32().setFromObject(artwork.mesh);
    const home = touchPads.find((pad) => pad.bit === 32);
    const loader = new SVGLoader();
    const ink = new MeshBasicMaterial3({ color: 16777215, side: DoubleSide3, toneMapped: false });
    for (const source of sources) {
      const bit = Number(source.dataset.badgeSymbol);
      const cap = caps.get(bit);
      let center;
      let size = 6e-3;
      if (cap) {
        center = new Box32().setFromObject(cap.mesh).getCenter(new Vector37());
        if (bit === 2) center.y += 65e-4;
        else if (bit === 1) center.y -= 65e-4;
        else center.x += 65e-4;
        center.z = frontBounds.max.z + 5e-5;
      } else if (bit === 32) {
        size = 5e-3;
        center = new Vector37(
          artBounds.min.x + (home.x0 + home.x1) / 2 / padTexture.width * (artBounds.max.x - artBounds.min.x),
          artBounds.max.y - (home.y0 + home.y1) / 2 / padTexture.height * (artBounds.max.y - artBounds.min.y) - 55e-4,
          artBounds.max.z + 5e-5
        );
      } else continue;
      const svg = source.cloneNode(true);
      svg.setAttribute("stroke", "#fff");
      const group = new Group2();
      group.name = `Control_symbol_${source.dataset.badgeSymbolName}`;
      root.worldToLocal(center);
      group.position.set(center.x - size / 2, center.y + size / 2, center.z);
      group.scale.set(size / 24, -size / 24, size / 24);
      root.add(group);
      for (const path of loader.parse(new XMLSerializer().serializeToString(svg)).paths) {
        for (const subpath of path.subPaths) {
          const geometry = SVGLoader.pointsToStroke(subpath.getPoints(16), path.userData.style);
          if (!geometry) continue;
          const stroke = new Mesh2(geometry, ink);
          group.add(stroke);
          targets.set(stroke, bit);
        }
      }
      if (!group.children.length) throw new Error(`Could not draw the badge ${source.dataset.badgeSymbolName} symbol.`);
    }
  }
  function disposeModel() {
    const materials = new Set(discarded);
    const textures = /* @__PURE__ */ new Set([texture]);
    model?.traverse((object) => {
      if (!(object instanceof Mesh2)) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    });
    for (const material of materials) {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose();
    }
    textures.forEach((texture2) => texture2.dispose());
  }
  return {
    ready,
    updateFrame,
    setButtons,
    zoom,
    setRotated,
    setDisplayRotated,
    setPose,
    resize() {
      if (!host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      view();
      baseDistance = camera.position.distanceTo(controls.target);
      controls.minDistance = baseDistance / 1.45;
      controls.maxDistance = baseDistance / 0.7;
      reportZoom();
    },
    setZoom(value) {
      if (!baseDistance || !Number.isFinite(value)) return;
      const offset = camera.position.clone().sub(controls.target);
      camera.position.copy(controls.target).add(offset.setLength(baseDistance / Math.max(0.7, Math.min(1.45, value))));
      controls.update();
      reportZoom();
      render();
    },
    resetView() {
      view();
      reportZoom();
    },
    getDebugState() {
      model?.updateMatrixWorld(true);
      const bounds = canvas.getBoundingClientRect();
      const project = (point) => {
        const p = point.clone().project(camera);
        return { x: bounds.left + (p.x + 1) * bounds.width / 2, y: bounds.top + (1 - p.y) * bounds.height / 2 };
      };
      const bits = {};
      for (const [bit, cap] of caps) bits[bit] = project(new Box32().setFromObject(cap.mesh).getCenter(new Vector37()));
      const pads = {};
      if (artwork) {
        const mesh = artwork.mesh;
        const position = mesh.geometry.getAttribute("position");
        const uv = mesh.geometry.getAttribute("uv");
        const index = mesh.geometry.index;
        const count = index ? index.count : position.count;
        for (const pad of touchPads) {
          const u = (pad.x0 + pad.x1) / 2 / padTexture.width;
          const v = (pad.y0 + pad.y1) / 2 / padTexture.height;
          for (let i = 0; i < count; i += 3) {
            const a = index ? index.getX(i) : i, b = index ? index.getX(i + 1) : i + 1, c = index ? index.getX(i + 2) : i + 2;
            const ax = uv.getX(a), ay = uv.getY(a), bx = uv.getX(b), by = uv.getY(b), cx = uv.getX(c), cy = uv.getY(c);
            const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
            if (Math.abs(denom) < 1e-12) continue;
            const wa = ((by - cy) * (u - cx) + (cx - bx) * (v - cy)) / denom;
            const wb = ((cy - ay) * (u - cx) + (ax - cx) * (v - cy)) / denom;
            const wc = 1 - wa - wb;
            if (wa < -1e-5 || wb < -1e-5 || wc < -1e-5) continue;
            const point = new Vector37().fromBufferAttribute(position, a).multiplyScalar(wa).addScaledVector(new Vector37().fromBufferAttribute(position, b), wb).addScaledVector(new Vector37().fromBufferAttribute(position, c), wc);
            pads[pad.bit] = project(mesh.localToWorld(point));
            break;
          }
        }
      }
      return { bits, pads, renders: rendered, zoom: baseDistance ? baseDistance / camera.position.distanceTo(controls.target) : 1, modelReady: Boolean(model), modelUrl: modelURL.href };
    },
    capture(width, height) {
      if (!model || disposed) throw new Error("The 3D badge is not ready.");
      const image = document.createElement("canvas");
      image.width = width;
      image.height = height;
      const paint = image.getContext("2d");
      if (!paint) throw new Error("Image export is unavailable in this browser.");
      updateFrame();
      renderer.render(scene, camera);
      const scale = Math.min(width / canvas.width, height / canvas.height);
      const drawWidth = canvas.width * scale;
      const drawHeight = canvas.height * scale;
      paint.drawImage(canvas, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      return image;
    },
    setBacklight(value) {
      displayMaterial.color.setScalar(Math.max(0, Math.min(1, value)));
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      idleRotation?.dispose();
      releaseAll();
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.removeEventListener("start", orbitStart);
      controls.removeEventListener("change", reportZoom);
      controls.dispose();
      screenButton.removeEventListener("click", focusScreen);
      fullButton?.removeEventListener("click", showFull);
      elements?.zoomIn?.removeEventListener("click", zoomIn);
      elements?.zoomOut?.removeEventListener("click", zoomOut);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", releaseAll);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("lostpointercapture", lostCapture);
      disposeModel();
      displayMaterial.dispose();
      renderer.dispose();
      if (displayOverlay?.parentElement === host) displayOverlay.remove();
      canvas.remove();
    }
  };
}
export {
  initBadgeModel,
  touchPadAt,
  touchPads,
  zoomStep
};
