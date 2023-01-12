/***
 * curtains.js v6.1.1
 * https://www.curtainsjs.com/
 *
 * @author: Martin Laxenaire
 * https://www.martin-laxenaire.fr/
 */
"use strict";

function Curtains(t) {
    var e;
    (this.planes = [], this.renderTargets = [], this.shaderPasses = [], this._imageCache = [], this._drawStacks = {
        opaque: {
            length: 0,
            programs: [],
            order: []
        },
        transparent: {
            length: 0,
            programs: [],
            order: []
        },
        renderPasses: [],
        scenePasses: []
    }, this._drawingEnabled = !0, this._forceRender = !1, "string" == typeof t) && (console.warn("Since v4.0 you should use an object to pass your container and other parameters. Please refer to the docs: https://www.curtainsjs.com/documentation.html"), t = {
        container: e = t
    });
    t.container ? "string" == typeof t.container ? this.container = document.getElementById(t.container) : t.container instanceof Element && (this.container = t.container) : ((e = document.createElement("div")).setAttribute("id", "curtains-canvas"), document.body.appendChild(e), this.container = e);
    if (this._autoResize = t.autoResize, null !== this._autoResize && void 0 !== this._autoResize || (this._autoResize = !0), this._autoRender = t.autoRender, null !== this._autoRender && void 0 !== this._autoRender || (this._autoRender = !0), this._watchScroll = t.watchScroll, null !== this._watchScroll && void 0 !== this._watchScroll || (this._watchScroll = !0), this.pixelRatio = t.pixelRatio || window.devicePixelRatio || 1, t.renderingScale = isNaN(t.renderingScale) ? 1 : parseFloat(t.renderingScale), this._renderingScale = Math.max(.25, Math.min(1, t.renderingScale)), this.premultipliedAlpha = t.premultipliedAlpha || !1, this.alpha = t.alpha, null !== this.alpha && void 0 !== this.alpha || (this.alpha = !0), this.antialias = t.antialias, null !== this.antialias && void 0 !== this.antialias || (this.antialias = !0), this.productionMode = t.production || !1, !this.container) return this.productionMode || console.warn("You must specify a valid container ID"), void(this._onErrorCallback && this._onErrorCallback());
    this._init()
}
Curtains.prototype._init = function() {
    this.glCanvas = document.createElement("canvas");
    var t = {
        alpha: this.alpha,
        premultipliedAlpha: this.premultipliedAlpha,
        antialias: this.antialias
    };
    if (this.gl = this.glCanvas.getContext("webgl2", t), this._isWebGL2 = !!this.gl, this.gl || (this.gl = this.glCanvas.getContext("webgl", t) || this.glCanvas.getContext("experimental-webgl", t)), !this.gl) return this.productionMode || console.warn("WebGL context could not be created"), void(this._onErrorCallback && this._onErrorCallback());
    this._getExtensions(), this._glState = {
        currentProgramID: null,
        programs: [],
        currentBuffersID: 0,
        setDepth: null,
        frameBufferID: null,
        scenePassIndex: null,
        cullFace: null,
        flipY: null
    }, this._contextLostHandler = this._contextLost.bind(this), this.glCanvas.addEventListener("webglcontextlost", this._contextLostHandler, !1), this._contextRestoredHandler = this._contextRestored.bind(this), this.glCanvas.addEventListener("webglcontextrestored", this._contextRestoredHandler, !1), this._scrollManager = {
        handler: this._scroll.bind(this, !0),
        shouldWatch: this._watchScroll,
        xOffset: window.pageXOffset,
        yOffset: window.pageYOffset,
        lastXDelta: 0,
        lastYDelta: 0
    }, this._watchScroll && window.addEventListener("scroll", this._scrollManager.handler, {
        passive: !0
    }), this.setPixelRatio(this.pixelRatio, !1), this._resizeHandler = null, this._autoResize && (this._resizeHandler = this.resize.bind(this, !0), window.addEventListener("resize", this._resizeHandler, !1)), this._readyToDraw()
}, Curtains.prototype._getExtensions = function() {
    this._extensions = [], this._isWebGL2 ? (this._extensions.EXT_color_buffer_float = this.gl.getExtension("EXT_color_buffer_float"), this._extensions.OES_texture_float_linear = this.gl.getExtension("OES_texture_float_linear"), this._extensions.WEBGL_lose_context = this.gl.getExtension("WEBGL_lose_context")) : (this._extensions.OES_vertex_array_object = this.gl.getExtension("OES_vertex_array_object"), this._extensions.OES_texture_float = this.gl.getExtension("OES_texture_float"), this._extensions.OES_texture_float_linear = this.gl.getExtension("OES_texture_float_linear"), this._extensions.OES_texture_half_float = this.gl.getExtension("OES_texture_half_float"), this._extensions.OES_texture_half_float_linear = this.gl.getExtension("OES_texture_half_float_linear"), this._extensions.OES_element_index_uint = this.gl.getExtension("OES_element_index_uint"), this._extensions.OES_standard_derivatives = this.gl.getExtension("OES_standard_derivatives"), this._extensions.EXT_sRGB = this.gl.getExtension("EXT_sRGB"), this._extensions.WEBGL_depth_texture = this.gl.getExtension("WEBGL_depth_texture"), this._extensions.WEBGL_draw_buffers = this.gl.getExtension("WEBGL_draw_buffers"), this._extensions.WEBGL_lose_context = this.gl.getExtension("WEBGL_lose_context"))
}, Curtains.prototype.setPixelRatio = function(t, e) {
    this.pixelRatio = parseFloat(Math.max(t, 1)) || 1, this.resize(e)
}, Curtains.prototype._setSize = function() {
    var t = this.container.getBoundingClientRect();
    this._boundingRect = {
        width: t.width * this.pixelRatio,
        height: t.height * this.pixelRatio,
        top: t.top * this.pixelRatio,
        left: t.left * this.pixelRatio
    };
    var e = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/),
        i = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (e && i) {
        this._boundingRect.top = function(t) {
            for (var e = 0; t && !isNaN(t.offsetTop);) e += t.offsetTop - t.scrollTop, t = t.offsetParent;
            return e
        }(this.container) * this.pixelRatio
    }
    this.glCanvas.style.width = Math.floor(this._boundingRect.width / this.pixelRatio) + "px", this.glCanvas.style.height = Math.floor(this._boundingRect.height / this.pixelRatio) + "px", this.glCanvas.width = Math.floor(this._boundingRect.width * this._renderingScale), this.glCanvas.height = Math.floor(this._boundingRect.height * this._renderingScale), this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight), this._scrollManager.shouldWatch && (this._scrollManager.xOffset = window.pageXOffset, this._scrollManager.yOffset = window.pageYOffset)
}, Curtains.prototype.getBoundingRect = function() {
    return this._boundingRect
}, Curtains.prototype.resize = function(t) {
    this._setSize();
    for (var e = 0; e < this.planes.length; e++) this.planes[e]._canDraw && this.planes[e].planeResize();
    for (e = 0; e < this.shaderPasses.length; e++) this.shaderPasses[e]._canDraw && this.shaderPasses[e].planeResize();
    for (e = 0; e < this.renderTargets.length; e++) this.renderTargets[e].resize();
    this.needRender();
    var i = this;
    setTimeout(function() {
        i._onAfterResizeCallback && t && i._onAfterResizeCallback()
    }, 0)
}, Curtains.prototype._scroll = function() {
    var t = {
        x: window.pageXOffset,
        y: window.pageYOffset
    };
    if (this.updateScrollValues(t.x, t.y), this._scrollManager.shouldWatch) {
        for (var e = 0; e < this.planes.length; e++) this.planes[e].watchScroll && this.planes[e].updateScrollPosition();
        this.needRender()
    }
    this._onScrollCallback && this._onScrollCallback()
}, Curtains.prototype.updateScrollValues = function(t, e) {
    var i = this._scrollManager.xOffset;
    this._scrollManager.xOffset = t, this._scrollManager.lastXDelta = i - this._scrollManager.xOffset;
    var s = this._scrollManager.yOffset;
    this._scrollManager.yOffset = e, this._scrollManager.lastYDelta = s - this._scrollManager.yOffset
}, Curtains.prototype.getScrollDeltas = function() {
    return {
        x: this._scrollManager.lastXDelta,
        y: this._scrollManager.lastYDelta
    }
}, Curtains.prototype.getScrollValues = function() {
    return {
        x: this._scrollManager.xOffset,
        y: this._scrollManager.yOffset
    }
}, Curtains.prototype.enableDrawing = function() {
    this._drawingEnabled = !0
}, Curtains.prototype.disableDrawing = function() {
    this._drawingEnabled = !1
}, Curtains.prototype.needRender = function() {
    this._forceRender = !0
}, Curtains.prototype._contextLost = function(t) {
    t.preventDefault(), this._glState = {
        currentProgramID: null,
        programs: [],
        currentBuffersID: 0,
        setDepth: null,
        frameBufferID: null,
        scenePassIndex: null,
        cullFace: null,
        flipY: null
    }, this._animationFrameID && window.cancelAnimationFrame(this._animationFrameID);
    var e = this;
    setTimeout(function() {
        e._onContextLostCallback && e._onContextLostCallback()
    }, 0)
}, Curtains.prototype.restoreContext = function() {
    this.gl && this._extensions.WEBGL_lose_context ? this._extensions.WEBGL_lose_context.restoreContext() : this.productionMode || (this.gl ? this._extensions.WEBGL_lose_context || console.warn("Could not restore context because the restore context extension is not defined") : console.warn("Could not restore context because the context is not defined"))
}, Curtains.prototype._contextRestored = function() {
    var t = this._drawingEnabled;
    this._drawingEnabled = !1, this._getExtensions(), this._setBlendFunc(), this._setDepth(!0), this._drawStacks = {
        opaque: {
            length: 0,
            programs: [],
            order: []
        },
        transparent: {
            length: 0,
            programs: [],
            order: []
        },
        renderPasses: [],
        scenePasses: []
    }, this._imageCache = [];
    for (var e = 0; e < this.renderTargets.length; e++) this.renderTargets[e]._restoreContext();
    for (e = 0; e < this.planes.length; e++) this.planes[e]._restoreContext();
    for (e = 0; e < this.shaderPasses.length; e++) this.shaderPasses[e]._restoreContext();
    this._onContextRestoredCallback && this._onContextRestoredCallback(), this._drawingEnabled = t, this.needRender(), this._autoRender && this._animate()
}, Curtains.prototype.dispose = function() {
    for (this._isDestroying = !0; this.planes.length > 0;) this.removePlane(this.planes[0]);
    for (; this.shaderPasses.length > 0;) this.removeShaderPass(this.shaderPasses[0]);
    for (; this.renderTargets.length > 0;) this.removeRenderTarget(this.renderTargets[0]);
    for (var t = 0; t < this._glState.programs.length; t++) {
        var e = this._glState.programs[t];
        this.gl.deleteProgram(e.program)
    }
    this._glState = {
        currentProgramID: null,
        programs: [],
        currentBuffersID: 0,
        setDepth: null,
        frameBufferID: null,
        scenePassIndex: null,
        cullFace: null,
        flipY: null
    };
    var i = this,
        s = setInterval(function() {
            0 === i.planes.length && 0 === i.shaderPasses.length && 0 === i.renderTargets.length && (clearInterval(s), i._clear(), i._animationFrameID && window.cancelAnimationFrame(i._animationFrameID), this._resizeHandler && window.removeEventListener("resize", i._resizeHandler, !1), this._watchScroll && window.removeEventListener("scroll", this._scrollManager.handler, {
                passive: !0
            }), i.glCanvas.removeEventListener("webgllost", i._contextLostHandler, !1), i.glCanvas.removeEventListener("webglrestored", i._contextRestoredHandler, !1), i.gl && i._extensions.WEBGL_lose_context && i._extensions.WEBGL_lose_context.loseContext(), i.glCanvas.width = i.glCanvas.width, i.gl = null, i.container.removeChild(i.glCanvas), i.container = null, i.glCanvas = null)
        }, 100)
}, Curtains.prototype._createShader = function(t, e) {
    var i = this.gl.createShader(e);
    if (this.gl.shaderSource(i, t), this.gl.compileShader(i), !this.productionMode && !this.gl.getShaderParameter(i, this.gl.COMPILE_STATUS)) {
        for (var s = e === this.gl.VERTEX_SHADER ? "vertex shader" : "fragment shader", r = this.gl.getShaderSource(i).split("\n"), a = 0; a < r.length; a++) r[a] = a + 1 + ": " + r[a];
        return r = r.join("\n"), console.warn("Errors occurred while compiling the", s, ":\n", this.gl.getShaderInfoLog(i)), console.error(r), null
    }
    return i
}, Curtains.prototype._isEqualShader = function(t, e) {
    var i = !1;
    return 0 === t.localeCompare(e) && (i = !0), i
}, Curtains.prototype._setupProgram = function(t, e, i) {
    for (var s = {}, r = 0; r < this._glState.programs.length; r++)
        if (this._isEqualShader(this._glState.programs[r].vsCode, t) && this._isEqualShader(this._glState.programs[r].fsCode, e)) {
            s = this._glState.programs[r];
            break
        } if (s.program) {
        if (i.shareProgram) return s;
        var a = this._useExistingShaders(s);
        return this._createProgram(a, i._type)
    }
    return !!(a = this._useNewShaders(t, e)) && this._createProgram(a, i._type)
}, Curtains.prototype._useExistingShaders = function(t) {
    return {
        vs: {
            vertexShader: t.vertexShader,
            vsCode: t.vsCode
        },
        fs: {
            fragmentShader: t.fragmentShader,
            fsCode: t.fsCode
        }
    }
}, Curtains.prototype._useNewShaders = function(t, e) {
    var i = !0,
        s = this._createShader(t, this.gl.VERTEX_SHADER),
        r = this._createShader(e, this.gl.FRAGMENT_SHADER);
    return s && r || (this.productionMode || console.warn("Unable to find or compile the vertex or fragment shader"), i = !1), i ? {
        vs: {
            vertexShader: s,
            vsCode: t
        },
        fs: {
            fragmentShader: r,
            fsCode: e
        }
    } : i
}, Curtains.prototype._createProgram = function(t, e) {
    var i = this.gl,
        s = !0,
        r = i.createProgram();
    if (s && (i.attachShader(r, t.vs.vertexShader), i.attachShader(r, t.fs.fragmentShader), i.linkProgram(r), this.productionMode || i.getProgramParameter(r, i.LINK_STATUS) || (console.warn("Unable to initialize the shader program."), s = !1), i.deleteShader(t.vs.vertexShader), i.deleteShader(t.fs.fragmentShader)), s) {
        var a = {
            id: this._glState.programs.length,
            vsCode: t.vs.vsCode,
            vertexShader: t.vs.vertexShader,
            fsCode: t.fs.fsCode,
            fragmentShader: t.fs.fragmentShader,
            program: r,
            type: e
        };
        return "Plane" === e && (this._drawStacks.opaque.programs["program-" + a.id] = [], this._drawStacks.transparent.programs["program-" + a.id] = []), this._glState.programs.push(a), a
    }
    return s
}, Curtains.prototype._useProgram = function(t) {
    null !== this._glState.currentProgramID && this._glState.currentProgramID === t.id || (this.gl.useProgram(t.program), this._glState.currentProgramID = t.id)
}, Curtains.prototype.addPlane = function(t, e) {
    if (this.gl) {
        if (!t || 0 === t.length) return this.productionMode || console.warn("The html element you specified does not currently exists in the DOM"), this._onErrorCallback && this._onErrorCallback(), !1;
        var i = new Curtains.Plane(this, t, e);
        return i._usedProgram ? this.planes.push(i) : i = !1, i
    }
    return this.productionMode || console.warn("Unable to create a plane. The WebGl context couldn't be created"), this._onErrorCallback && this._onErrorCallback(), null
}, Curtains.prototype.removePlane = function(t) {
    t._canDraw = !1;
    var e, i = t._transparent ? "transparent" : "opaque";
    t && t._dispose();
    for (var s = 0; s < this.planes.length; s++) t.uuid === this.planes[s].uuid && (e = s);
    t = null, this.planes[e] = null, this.planes.splice(e, 1);
    for (s = 0; s < this._glState.programs.length; s++) this._drawStacks.opaque.programs["program-" + this._glState.programs[s].id] = [], this._drawStacks.transparent.programs["program-" + this._glState.programs[s].id] = [];
    this._drawStacks.opaque.length = 0, this._drawStacks.transparent.length = 0;
    for (s = 0; s < this.planes.length; s++) {
        (t = this.planes[s]).index = s;
        var r = t._transparent ? "transparent" : "opaque";
        "transparent" === r ? this._drawStacks[r].programs["program-" + t._usedProgram.id].unshift(t.index) : this._drawStacks[r].programs["program-" + t._usedProgram.id].push(t.index), this._drawStacks[r].length++
    }
    for (s = 0; s < this._drawStacks[i].order.length; s++) {
        var a = this._drawStacks[i].order[s];
        0 === this._drawStacks[i].programs["program-" + a].length && this._drawStacks[i].order.splice(s, 1)
    }
    this.gl && this._clear(), this._glState.currentBuffersID = 0
}, Curtains.prototype._stackPlane = function(t) {
    var e = t._transparent ? "transparent" : "opaque",
        i = this._drawStacks[e];
    "transparent" === e ? (i.programs["program-" + t._usedProgram.id].unshift(t.index), i.order.includes(t._usedProgram.id) || i.order.unshift(t._usedProgram.id)) : (i.programs["program-" + t._usedProgram.id].push(t.index), i.order.includes(t._usedProgram.id) || i.order.push(t._usedProgram.id)), i.length++
}, Curtains.prototype.addRenderTarget = function(t) {
    return this.gl ? new Curtains.RenderTarget(this, t) : (this.productionMode || console.warn("Unable to create a render target. The WebGl context couldn't be created"), this._onErrorCallback && this._onErrorCallback(), null)
}, Curtains.prototype.removeRenderTarget = function(t) {
    if (t._shaderPass) this.productionMode || console.warn("You're trying to remove a render target attached to a shader pass. You should remove that shader pass instead:", t._shaderPass);
    else {
        for (var e = 0; e < this.planes.length; e++) this.planes[e].target && this.planes[e].target.uuid === t.uuid && (this.planes[e].target = null);
        var i;
        for (e = 0; e < this.renderTargets.length; e++) t.uuid === this.renderTargets[e].uuid && (i = e);
        this.renderTargets[i] = null, this.renderTargets.splice(i, 1), t && t._dispose(), t = null, this.gl && this._clear(), this._glState.currentBuffersID = 0
    }
}, Curtains.prototype.addShaderPass = function(t) {
    if (this.gl) {
        var e = new Curtains.ShaderPass(this, t);
        return e._usedProgram ? (t.renderTarget ? this._drawStacks.renderPasses.push(e.index) : this._drawStacks.scenePasses.push(e.index), this.shaderPasses.push(e)) : e = !1, e
    }
    return this.productionMode || console.warn("Unable to create a shader pass. The WebGl context couldn't be created"), this._onErrorCallback && this._onErrorCallback(), null
}, Curtains.prototype.removeShaderPass = function(t) {
    var e;
    t._canDraw = !1, t.target && (t.target._shaderPass = null, this.removeRenderTarget(t.target), t.target = null);
    for (var i = 0; i < this.shaderPasses.length; i++) t.uuid === this.shaderPasses[i].uuid && (e = i);
    this.shaderPasses.splice(e, 1), this._drawStacks.scenePasses = [], this._drawStacks.renderPasses = [];
    for (i = 0; i < this.shaderPasses.length; i++) this.shaderPasses[i].index = i, this.shaderPasses[i]._isScenePass ? this._drawStacks.scenePasses.push(this.shaderPasses[i].index) : this._drawStacks.renderPasses.push(this.shaderPasses[i].index);
    0 === this._drawStacks.scenePasses.length && (this._glState.scenePassIndex = null), t && t._dispose(), t = null, this.gl && this._clear(), this._glState.currentBuffersID = 0
}, Curtains.prototype._clear = function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
}, Curtains.prototype._bindFrameBuffer = function(t, e) {
    var i = null;
    t ? (i = t.index) !== this._glState.frameBufferID && (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, t._frameBuffer), this.gl.viewport(0, 0, t._size.width, t._size.height), t._shouldClear && !e && this._clear()) : null !== this._glState.frameBufferID && (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null), this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)), this._glState.frameBufferID = i
}, Curtains.prototype._setDepth = function(t) {
    t && !this._glState.depthTest ? (this._glState.depthTest = t, this.gl.enable(this.gl.DEPTH_TEST)) : !t && this._glState.depthTest && (this._glState.depthTest = t, this.gl.disable(this.gl.DEPTH_TEST))
}, Curtains.prototype._setBlendFunc = function() {
    var t = this.gl;
    t.enable(t.BLEND), this.premultipliedAlpha ? t.blendFuncSeparate(t.ONE, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA) : t.blendFuncSeparate(t.SRC_ALPHA, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA)
}, Curtains.prototype._setFaceCulling = function(t) {
    var e = this.gl;
    if (this._glState.cullFace !== t)
        if (this._glState.cullFace = t, "none" === t) e.disable(e.CULL_FACE);
        else {
            var i = "front" === t ? e.FRONT : e.BACK;
            e.enable(e.CULL_FACE), e.cullFace(i)
        }
}, Curtains.prototype._generateUUID = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(t) {
        var e = 16 * Math.random() | 0;
        return ("x" == t ? e : 3 & e | 8).toString(16).toUpperCase()
    })
}, Curtains.prototype._multiplyMatrix = function(t, e) {
    var i = new Float32Array(16);
    return i[0] = e[0] * t[0] + e[1] * t[4] + e[2] * t[8] + e[3] * t[12], i[1] = e[0] * t[1] + e[1] * t[5] + e[2] * t[9] + e[3] * t[13], i[2] = e[0] * t[2] + e[1] * t[6] + e[2] * t[10] + e[3] * t[14], i[3] = e[0] * t[3] + e[1] * t[7] + e[2] * t[11] + e[3] * t[15], i[4] = e[4] * t[0] + e[5] * t[4] + e[6] * t[8] + e[7] * t[12], i[5] = e[4] * t[1] + e[5] * t[5] + e[6] * t[9] + e[7] * t[13], i[6] = e[4] * t[2] + e[5] * t[6] + e[6] * t[10] + e[7] * t[14], i[7] = e[4] * t[3] + e[5] * t[7] + e[6] * t[11] + e[7] * t[15], i[8] = e[8] * t[0] + e[9] * t[4] + e[10] * t[8] + e[11] * t[12], i[9] = e[8] * t[1] + e[9] * t[5] + e[10] * t[9] + e[11] * t[13], i[10] = e[8] * t[2] + e[9] * t[6] + e[10] * t[10] + e[11] * t[14], i[11] = e[8] * t[3] + e[9] * t[7] + e[10] * t[11] + e[11] * t[15], i[12] = e[12] * t[0] + e[13] * t[4] + e[14] * t[8] + e[15] * t[12], i[13] = e[12] * t[1] + e[13] * t[5] + e[14] * t[9] + e[15] * t[13], i[14] = e[12] * t[2] + e[13] * t[6] + e[14] * t[10] + e[15] * t[14], i[15] = e[12] * t[3] + e[13] * t[7] + e[14] * t[11] + e[15] * t[15], i
}, Curtains.prototype._scaleMatrix = function(t, e, i, s) {
    var r = new Float32Array(16);
    return r[0] = e * t[0], r[1] = e * t[1], r[2] = e * t[2], r[3] = e * t[3], r[4] = i * t[4], r[5] = i * t[5], r[6] = i * t[6], r[7] = i * t[7], r[8] = s * t[8], r[9] = s * t[9], r[10] = s * t[10], r[11] = s * t[11], t !== r && (r[12] = t[12], r[13] = t[13], r[14] = t[14], r[15] = t[15]), r
}, Curtains.prototype._composeMatrixFromOrigin = function(t, e, i, s) {
    var r = new Float32Array(16),
        a = e[0],
        n = e[1],
        o = e[2],
        h = e[3],
        u = a + a,
        l = n + n,
        _ = o + o,
        c = a * u,
        d = a * l,
        p = a * _,
        g = n * l,
        f = n * _,
        m = o * _,
        x = h * u,
        v = h * l,
        P = h * _,
        y = i.x,
        b = i.y,
        C = s.x,
        T = s.y,
        S = s.z,
        w = (1 - (g + m)) * y,
        R = (d + P) * y,
        M = (p - v) * y,
        E = (d - P) * b,
        B = (1 - (c + m)) * b,
        D = (f + x) * b,
        F = 1 * (p + v),
        A = 1 * (f - x),
        L = 1 * (1 - (c + g));
    return r[0] = w, r[1] = R, r[2] = M, r[3] = 0, r[4] = E, r[5] = B, r[6] = D, r[7] = 0, r[8] = F, r[9] = A, r[10] = L, r[11] = 0, r[12] = t.x + C - (w * C + E * T + F * S), r[13] = t.y + T - (R * C + B * T + A * S), r[14] = t.z + S - (M * C + D * T + L * S), r[15] = 1, r
}, Curtains.prototype._applyMatrixToPoint = function(t, e) {
    var i = [],
        s = t[0],
        r = t[1],
        a = t[2];
    i[0] = e[0] * s + e[4] * r + e[8] * a + e[12], i[1] = e[1] * s + e[5] * r + e[9] * a + e[13], i[2] = e[2] * s + e[6] * r + e[10] * a + e[14];
    var n = e[3] * s + e[7] * r + e[11] * a + e[15];
    return n = n || 1, i[0] /= n, i[1] /= n, i[2] /= n, i
}, Curtains.prototype._readyToDraw = function() {
    this.container.appendChild(this.glCanvas), this._setBlendFunc(), this._setDepth(!0), console.log("curtains.js - v6.1"), this._animationFrameID = null, this._autoRender && this._animate()
}, Curtains.prototype._animate = function() {
    this.render(), this._animationFrameID = window.requestAnimationFrame(this._animate.bind(this))
}, Curtains.prototype._drawPlaneStack = function(t) {
    for (var e = 0; e < this._drawStacks[t].order.length; e++)
        for (var i = this._drawStacks[t].order[e], s = this._drawStacks[t].programs["program-" + i], r = 0; r < s.length; r++) {
            var a = this.planes[s[r]];
            a && a._drawPlane()
        }
}, Curtains.prototype.render = function() {
    if (this._drawingEnabled || this._forceRender) {
        this._forceRender && (this._forceRender = !1), this._onRenderCallback && this._onRenderCallback(), this._clear(), this._drawStacks.scenePasses.length > 0 && 0 === this._drawStacks.renderPasses.length && (this._glState.scenePassIndex = 0, this._bindFrameBuffer(this.shaderPasses[this._drawStacks.scenePasses[0]].target)), this._drawPlaneStack("opaque"), this._drawStacks.transparent.length && (this.gl.clearDepth(1), this.gl.clear(this.gl.DEPTH_BUFFER_BIT), this._drawPlaneStack("transparent")), this._drawStacks.scenePasses.length > 0 && this._drawStacks.renderPasses.length > 0 && (this._glState.scenePassIndex = 0, this._bindFrameBuffer(this.shaderPasses[this._drawStacks.scenePasses[0]].target));
        for (var t = 0; t < this._drawStacks.renderPasses.length; t++) {
            this.shaderPasses[this._drawStacks.renderPasses[t]]._drawPlane()
        }
        if (this._drawStacks.scenePasses.length > 0)
            for (t = 0; t < this._drawStacks.scenePasses.length; t++) {
                this.shaderPasses[this._drawStacks.scenePasses[t]]._drawPlane()
            }
    }
}, Curtains.prototype.onAfterResize = function(t) {
    return t && (this._onAfterResizeCallback = t), this
}, Curtains.prototype.onError = function(t) {
    return t && (this._onErrorCallback = t), this
}, Curtains.prototype.onContextLost = function(t) {
    return t && (this._onContextLostCallback = t), this
}, Curtains.prototype.onContextRestored = function(t) {
    return t && (this._onContextRestoredCallback = t), this
}, Curtains.prototype.onRender = function(t) {
    return t && (this._onRenderCallback = t), this
}, Curtains.prototype.onScroll = function(t) {
    return t && (this._onScrollCallback = t), this
}, Curtains.BasePlane = function(t, e, i) {
    this._type = this._type || "BasicPlane", this._curtains = t, this.htmlElement = e, this.uuid = this._curtains._generateUUID(), this._initBasePlane(i)
}, Curtains.BasePlane.prototype._initBasePlane = function(t) {
    if (t || (t = {}), this._canDraw = !1, this.shareProgram = t.shareProgram || !1, this._updatePerspectiveMatrix = !1, this._updateMVMatrix = !1, this._definition = {
            width: parseInt(t.widthSegments) || 1,
            height: parseInt(t.heightSegments) || 1
        }, this._definition.buffersID = this._definition.width * this._definition.height + this._definition.width, this._depthTest = t.depthTest, null !== this._depthTest && void 0 !== this._depthTest || (this._depthTest = !0), this.cullFace = t.cullFace, "back" !== this.cullFace && "front" !== this.cullFace && "none" !== this.cullFace && (this.cullFace = "back"), this._activeTextures = [], t.uniforms || (t.uniforms = {}), this.uniforms = {}, t.uniforms)
        for (var e in t.uniforms) {
            var i = t.uniforms[e];
            this.uniforms[e] = {
                name: i.name,
                type: i.type,
                value: i.value,
                lastValue: i.value
            }
        }
    var s = this._setupShaders(t);
    return this._usedProgram = this._curtains._setupProgram(s.vertexShaderCode, s.fragmentShaderCode, this), this._loadingManager = {
        sourcesLoaded: 0,
        initSourcesToLoad: 0,
        complete: !1
    }, this.images = [], this.videos = [], this.canvases = [], this.textures = [], this.crossOrigin = t.crossOrigin || "anonymous", this.userData = {}, !!this._usedProgram && (this._shouldDraw = !0, this.visible = !0, this._setAttributes(), this._setDocumentSizes(), this._setUniforms(), this._initializeBuffers(), this._canDraw = !0, this)
}, Curtains.BasePlane.prototype._getDefaultVS = function() {
    return this._curtains.productionMode || console.warn("No vertex shader provided, will use a default one"), "precision mediump float;\nattribute vec3 aVertexPosition;attribute vec2 aTextureCoord;uniform mat4 uMVMatrix;uniform mat4 uPMatrix;varying vec3 vVertexPosition;varying vec2 vTextureCoord;void main() {vTextureCoord = aTextureCoord;vVertexPosition = aVertexPosition;gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);}"
}, Curtains.BasePlane.prototype._getDefaultFS = function() {
    return "precision mediump float;\nvarying vec3 vVertexPosition;varying vec2 vTextureCoord;void main( void ) {gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);}"
}, Curtains.BasePlane.prototype._setupShaders = function(t) {
    var e, i, s = t.vertexShaderID || this.htmlElement.getAttribute("data-vs-id"),
        r = t.fragmentShaderID || this.htmlElement.getAttribute("data-fs-id");
    return t.vertexShader || (e = s && document.getElementById(s) ? document.getElementById(s).innerHTML : this._getDefaultVS()), t.fragmentShader || (r && document.getElementById(r) ? i = document.getElementById(r).innerHTML : (this._curtains.productionMode || console.warn("No fragment shader provided, will use a default one"), i = this._getDefaultFS())), {
        vertexShaderCode: t.vertexShader || e,
        fragmentShaderCode: t.fragmentShader || i
    }
}, Curtains.BasePlane.prototype._handleUniformSetting = function(t, e, i) {
    var s = this._curtains.gl;
    switch (t) {
        case "1i":
            s.uniform1i(e, i);
            break;
        case "1iv":
            s.uniform1iv(e, i);
            break;
        case "1f":
            s.uniform1f(e, i);
            break;
        case "1fv":
            s.uniform1fv(e, i);
            break;
        case "2i":
            s.uniform2i(e, i[0], i[1]);
            break;
        case "2iv":
            s.uniform2iv(e, i);
            break;
        case "2f":
            s.uniform2f(e, i[0], i[1]);
            break;
        case "2fv":
            s.uniform2fv(e, i);
            break;
        case "3i":
            s.uniform3i(e, i[0], i[1], i[2]);
            break;
        case "3iv":
            s.uniform3iv(e, i);
            break;
        case "3f":
            s.uniform3f(e, i[0], i[1], i[2]);
            break;
        case "3fv":
            s.uniform3fv(e, i);
            break;
        case "4i":
            s.uniform4i(e, i[0], i[1], i[2], i[3]);
            break;
        case "4iv":
            s.uniform4iv(e, i);
            break;
        case "4f":
            s.uniform4f(e, i[0], i[1], i[2], i[3]);
            break;
        case "4fv":
            s.uniform4fv(e, i);
            break;
        case "mat2":
            s.uniformMatrix2fv(e, !1, i);
            break;
        case "mat3":
            s.uniformMatrix3fv(e, !1, i);
            break;
        case "mat4":
            s.uniformMatrix4fv(e, !1, i);
            break;
        default:
            this._curtains.productionMode || console.warn("This uniform type is not handled : ", t)
    }
}, Curtains.BasePlane.prototype._setUniforms = function() {
    var t = this._curtains,
        e = t.gl;
    t._useProgram(this._usedProgram);
    for (var i = e.getProgramParameter(this._usedProgram.program, e.ACTIVE_UNIFORMS), s = 0; s < i; s++) {
        var r = e.getActiveUniform(this._usedProgram.program, s);
        r.type === e.SAMPLER_2D && this._activeTextures.push(r)
    }
    if (this.uniforms)
        for (var a in this.uniforms) {
            var n = this.uniforms[a];
            n.location = e.getUniformLocation(this._usedProgram.program, n.name), n.type || (Array.isArray(n.value) ? 4 === n.value.length ? (n.type = "4f", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a 4f (array of 4 floats) uniform type")) : 3 === n.value.length ? (n.type = "3f", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a 3f (array of 3 floats) uniform type")) : 2 === n.value.length && (n.type = "2f", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a 2f (array of 2 floats) uniform type")) : n.value.constructor === Float32Array ? 16 === n.value.length ? (n.type = "mat4", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a mat4 (4x4 matrix array) uniform type")) : 9 === n.value.length ? (n.type = "mat3", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a mat3 (3x3 matrix array) uniform type")) : 4 === n.value.length && (n.type = "mat2", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a mat2 (2x2 matrix array) uniform type")) : (n.type = "1f", t.productionMode || console.warn("No uniform type declared for " + n.name + ", applied a 1f (float) uniform type"))), this._handleUniformSetting(n.type, n.location, n.value)
        }
}, Curtains.BasePlane.prototype._updateUniforms = function() {
    if (this.uniforms)
        for (var t in this.uniforms) {
            var e = this.uniforms[t];
            this.shareProgram ? this._handleUniformSetting(e.type, e.location, e.value) : (e.value.length || e.value === e.lastValue ? JSON.stringify(e.value) !== JSON.stringify(e.lastValue) && this._handleUniformSetting(e.type, e.location, e.value) : this._handleUniformSetting(e.type, e.location, e.value), e.lastValue = e.value)
        }
}, Curtains.BasePlane.prototype._setAttributes = function() {
    this._attributes || (this._attributes = {}), this._attributes.vertexPosition = {
        name: "aVertexPosition",
        location: this._curtains.gl.getAttribLocation(this._usedProgram.program, "aVertexPosition")
    }, this._attributes.textureCoord = {
        name: "aTextureCoord",
        location: this._curtains.gl.getAttribLocation(this._usedProgram.program, "aTextureCoord")
    }
}, Curtains.BasePlane.prototype._setPlaneVertices = function() {
    this._geometry = {
        vertices: []
    }, this._material = {
        uvs: []
    };
    for (var t = 0; t < this._definition.height; ++t)
        for (var e = t / this._definition.height, i = 0; i < this._definition.width; ++i) {
            var s = i / this._definition.width;
            this._material.uvs.push(s), this._material.uvs.push(e), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s - .5)), this._geometry.vertices.push(2 * (e - .5)), this._geometry.vertices.push(0), this._material.uvs.push(s + 1 / this._definition.width), this._material.uvs.push(e), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s + 1 / this._definition.width - .5)), this._geometry.vertices.push(2 * (e - .5)), this._geometry.vertices.push(0), this._material.uvs.push(s), this._material.uvs.push(e + 1 / this._definition.height), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s - .5)), this._geometry.vertices.push(2 * (e + 1 / this._definition.height - .5)), this._geometry.vertices.push(0), this._material.uvs.push(s), this._material.uvs.push(e + 1 / this._definition.height), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s - .5)), this._geometry.vertices.push(2 * (e + 1 / this._definition.height - .5)), this._geometry.vertices.push(0), this._material.uvs.push(s + 1 / this._definition.width), this._material.uvs.push(e), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s + 1 / this._definition.width - .5)), this._geometry.vertices.push(2 * (e - .5)), this._geometry.vertices.push(0), this._material.uvs.push(s + 1 / this._definition.width), this._material.uvs.push(e + 1 / this._definition.height), this._material.uvs.push(0), this._geometry.vertices.push(2 * (s + 1 / this._definition.width - .5)), this._geometry.vertices.push(2 * (e + 1 / this._definition.height - .5)), this._geometry.vertices.push(0)
        }
}, Curtains.BasePlane.prototype._initializeBuffers = function() {
    var t = this._curtains.gl;
    this._geometry || this._material || this._setPlaneVertices(), this._attributes && (this._geometry.bufferInfos = {
        id: t.createBuffer(),
        itemSize: 3,
        numberOfItems: this._geometry.vertices.length / 3
    }, this._material.bufferInfos = {
        id: t.createBuffer(),
        itemSize: 3,
        numberOfItems: this._material.uvs.length / 3
    }, this._curtains._isWebGL2 ? (this._vao = t.createVertexArray(), t.bindVertexArray(this._vao)) : this._curtains._extensions.OES_vertex_array_object && (this._vao = this._curtains._extensions.OES_vertex_array_object.createVertexArrayOES(), this._curtains._extensions.OES_vertex_array_object.bindVertexArrayOES(this._vao)), t.enableVertexAttribArray(this._attributes.vertexPosition.location), t.bindBuffer(t.ARRAY_BUFFER, this._geometry.bufferInfos.id), t.bufferData(t.ARRAY_BUFFER, new Float32Array(this._geometry.vertices), t.STATIC_DRAW), t.vertexAttribPointer(this._attributes.vertexPosition.location, this._geometry.bufferInfos.itemSize, t.FLOAT, !1, 0, 0), t.enableVertexAttribArray(this._attributes.textureCoord.location), t.bindBuffer(t.ARRAY_BUFFER, this._material.bufferInfos.id), t.bufferData(t.ARRAY_BUFFER, new Float32Array(this._material.uvs), t.STATIC_DRAW), t.vertexAttribPointer(this._attributes.textureCoord.location, this._material.bufferInfos.itemSize, t.FLOAT, !1, 0, 0), this._curtains._glState.currentBuffersID = this._definition.buffersID)
}, Curtains.BasePlane.prototype._restoreContext = function() {
    var t = this._curtains;
    if (this._canDraw = !1, this._matrices && (this._matrices = null), this._attributes = null, this._geometry.bufferInfos = null, this._material.bufferInfos = null, this._usedProgram = t._setupProgram(this._usedProgram.vsCode, this._usedProgram.fsCode, this), this._usedProgram) {
        if (this._setAttributes(), this._activeTextures = [], this._setUniforms(), this._initializeBuffers(), "ShaderPass" === this._type)
            if (this._isScenePass) this.target._frameBuffer = null, this.target._depthBuffer = null, t.renderTargets.splice(this.target.index, 1), this.textures.splice(0, 1), this._createFrameBuffer(), t._drawStacks.scenePasses.push(this.index);
            else {
                var e = t.renderTargets[this.target.index];
                this.setRenderTarget(e), this.target._shaderPass = e, this.textures[0]._canDraw = !1, this.textures[0]._setTextureUniforms(), this.textures[0].setFromTexture(e.textures[0]), t._drawStacks.renderPasses.push(this.index)
            }
        else this.target && this.setRenderTarget(t.renderTargets[this.target.index]);
        for (var i = "ShaderPass" === this._type ? 1 : 0; i < this.textures.length; i++) this.textures[i]._restoreContext();
        "Plane" === this._type && (this._initMatrices(), this.setPerspective(this._fov, this._nearPlane, this._farPlane), this._applyWorldPositions(), t._stackPlane(this)), this._canDraw = !0
    }
}, Curtains.BasePlane.prototype._setDocumentSizes = function() {
    var t = this.htmlElement.getBoundingClientRect();
    0 === t.width && 0 === t.height && (t = this._curtains._boundingRect), this._boundingRect || (this._boundingRect = {}), this._boundingRect.document = {
        width: t.width * this._curtains.pixelRatio,
        height: t.height * this._curtains.pixelRatio,
        top: t.top * this._curtains.pixelRatio,
        left: t.left * this._curtains.pixelRatio
    }
}, Curtains.BasePlane.prototype.getBoundingRect = function() {
    return {
        width: this._boundingRect.document.width,
        height: this._boundingRect.document.height,
        top: this._boundingRect.document.top,
        left: this._boundingRect.document.left,
        right: this._boundingRect.document.left + this._boundingRect.document.width,
        bottom: this._boundingRect.document.top + this._boundingRect.document.height
    }
}, Curtains.BasePlane.prototype._getNearPlaneIntersections = function(t, e, i) {
    function s(t, e) {
        for (var i = [e[0] - t[0], e[1] - t[1], e[2] - t[2]], s = t.slice(); s[2] > -1;) s[0] += i[0], s[1] += i[1], s[2] += i[2];
        return s
    }
    if (1 === i.length) 0 === i[0] ? (e[0] = s(e[1], this._curtains._applyMatrixToPoint([.95, 1, 0], this._matrices.mVPMatrix)), e.push(s(e[3], this._curtains._applyMatrixToPoint([-1, -.95, 0], this._matrices.mVPMatrix)))) : 1 === i[0] ? (e[1] = s(e[0], this._curtains._applyMatrixToPoint([-.95, 1, 0], this._matrices.mVPMatrix)), e.push(s(e[2], this._curtains._applyMatrixToPoint([1, -.95, 0], this._matrices.mVPMatrix)))) : 2 === i[0] ? (e[2] = s(e[3], this._curtains._applyMatrixToPoint([-.95, -1, 0], this._matrices.mVPMatrix)), e.push(s(e[1], this._curtains._applyMatrixToPoint([1, .95, 0], this._matrices.mVPMatrix)))) : 3 === i[0] && (e[3] = s(e[2], this._curtains._applyMatrixToPoint([.95, -1, 0], this._matrices.mVPMatrix)), e.push(s(e[0], this._curtains._applyMatrixToPoint([-1, .95, 0], this._matrices.mVPMatrix))));
    else if (2 === i.length) 0 === i[0] && 1 === i[1] ? (e[0] = s(e[3], this._curtains._applyMatrixToPoint([-1, -.95, 0], this._matrices.mVPMatrix)), e[1] = s(e[2], this._curtains._applyMatrixToPoint([1, -.95, 0], this._matrices.mVPMatrix))) : 1 === i[0] && 2 === i[1] ? (e[1] = s(e[0], this._curtains._applyMatrixToPoint([-.95, 1, 0], this._matrices.mVPMatrix)), e[2] = s(e[3], this._curtains._applyMatrixToPoint([-.95, -1, 0], this._matrices.mVPMatrix))) : 2 === i[0] && 3 === i[1] ? (e[2] = s(e[1], this._curtains._applyMatrixToPoint([1, .95, 0], this._matrices.mVPMatrix)), e[3] = s(e[0], this._curtains._applyMatrixToPoint([-1, .95, 0], this._matrices.mVPMatrix))) : 0 === i[0] && 3 === i[1] && (e[0] = s(e[1], this._curtains._applyMatrixToPoint([.95, 1, 0], this._matrices.mVPMatrix)), e[3] = s(e[2], this._curtains._applyMatrixToPoint([.95, -1, 0], this._matrices.mVPMatrix)));
    else if (3 === i.length) {
        for (var r = 0, a = 0; a < t.length; a++) i.includes(a) || (r = a);
        e = [e[r]], 0 === r ? (e.push(s(e[0], this._curtains._applyMatrixToPoint([-.95, 1, 0], this._matrices.mVPMatrix))), e.push(s(e[0], this._curtains._applyMatrixToPoint([-1, .95, 0], this._matrices.mVPMatrix)))) : 1 === r ? (e.push(s(e[0], this._curtains._applyMatrixToPoint([.95, 1, 0], this._matrices.mVPMatrix))), e.push(s(e[0], this._curtains._applyMatrixToPoint([1, .95, 0], this._matrices.mVPMatrix)))) : 2 === r ? (e.push(s(e[0], this._curtains._applyMatrixToPoint([.95, -1, 0], this._matrices.mVPMatrix))), e.push(s(e[0], this._curtains._applyMatrixToPoint([1, -.95, 0], this._matrices.mVPMatrix)))) : 3 === r && (e.push(s(e[0], this._curtains._applyMatrixToPoint([-.95, -1, 0], this._matrices.mVPMatrix))), e.push(s(e[0], this._curtains._applyMatrixToPoint([-1, -.95, 0], this._matrices.mVPMatrix))))
    } else
        for (a = 0; a < t.length; a++) e[a][0] = 1e4, e[a][1] = 1e4;
    return e
}, Curtains.BasePlane.prototype._getWorldCoords = function() {
    for (var t = [
            [-1, 1, 0],
            [1, 1, 0],
            [1, -1, 0],
            [-1, -1, 0]
        ], e = [], i = [], s = 0; s < t.length; s++) {
        var r = this._curtains._applyMatrixToPoint(t[s], this._matrices.mVPMatrix);
        e.push(r), Math.abs(r[2]) > 1 && i.push(s)
    }
    i.length && (e = this._getNearPlaneIntersections(t, e, i));
    var a = 1 / 0,
        n = -1 / 0,
        o = 1 / 0,
        h = -1 / 0;
    for (s = 0; s < e.length; s++) {
        var u = e[s];
        u[0] < a && (a = u[0]), u[0] > n && (n = u[0]), u[1] < o && (o = u[1]), u[1] > h && (h = u[1])
    }
    return {
        top: h,
        right: n,
        bottom: o,
        left: a
    }
}, Curtains.BasePlane.prototype.getWebGLBoundingRect = function() {
    if (this._matrices.mVPMatrix) {
        var t = this._getWorldCoords(),
            e = {
                top: 1 - (t.top + 1) / 2,
                right: (t.right + 1) / 2,
                bottom: 1 - (t.bottom + 1) / 2,
                left: (t.left + 1) / 2
            };
        return e.width = e.right - e.left, e.height = e.bottom - e.top, {
            width: e.width * this._curtains._boundingRect.width,
            height: e.height * this._curtains._boundingRect.height,
            top: e.top * this._curtains._boundingRect.height + this._curtains._boundingRect.top,
            left: e.left * this._curtains._boundingRect.width + this._curtains._boundingRect.left,
            right: e.left * this._curtains._boundingRect.width + this._curtains._boundingRect.left + e.width * this._curtains._boundingRect.width,
            bottom: e.top * this._curtains._boundingRect.height + this._curtains._boundingRect.top + e.height * this._curtains._boundingRect.height
        }
    }
    return this._boundingRect.document
}, Curtains.BasePlane.prototype._getWebGLDrawRect = function() {
    var t = this.getWebGLBoundingRect();
    return {
        top: t.top - this.drawCheckMargins.top,
        right: t.right + this.drawCheckMargins.right,
        bottom: t.bottom + this.drawCheckMargins.bottom,
        left: t.left - this.drawCheckMargins.left
    }
}, Curtains.BasePlane.prototype.planeResize = function() {
    this._setDocumentSizes(), "Plane" === this._type && (this.setPerspective(this._fov, this._nearPlane, this._farPlane), this._applyWorldPositions());
    for (var t = 0; t < this.textures.length; t++) this.textures[t].resize();
    var e = this;
    setTimeout(function() {
        e._onAfterResizeCallback && e._onAfterResizeCallback()
    }, 0)
}, Curtains.BasePlane.prototype.createTexture = function(t) {
    "string" == typeof t && (t = {
        sampler: t
    }, this._curtains.productionMode || console.warn("Since v5.1 you should use an object to pass your sampler name with the createTexture() method. Please refer to the docs: https://www.curtainsjs.com/documentation.html (texture concerned: ", t.sampler, ")")), t || (t = {});
    var e = new Curtains.Texture(this, {
        index: this.textures.length,
        sampler: t.sampler || null,
        fromTexture: t.fromTexture || null,
        isFBOTexture: t.isFBOTexture || !1
    });
    return this.textures.push(e), e
}, Curtains.BasePlane.prototype._isPlaneReady = function() {
    if (!this._loadingManager.complete && this._loadingManager.sourcesLoaded >= this._loadingManager.initSourcesToLoad) {
        this._loadingManager.complete = !0, this._curtains.needRender();
        var t = this;
        setTimeout(function() {
            t._onReadyCallback && t._onReadyCallback()
        }, 0)
    }
}, Curtains.BasePlane.prototype.loadSources = function(t) {
    for (var e = 0; e < t.length; e++) this.loadSource(t[e])
}, Curtains.BasePlane.prototype.loadSource = function(t) {
    "IMG" === t.tagName.toUpperCase() ? this.loadImage(t) : "VIDEO" === t.tagName.toUpperCase() ? this.loadVideo(t) : "CANVAS" === t.tagName.toUpperCase() ? this.loadCanvas(t) : this._curtains.productionMode || console.warn("this HTML tag could not be converted into a texture:", t.tagName)
}, Curtains.BasePlane.prototype._sourceLoadError = function(t, e) {
    this._curtains.productionMode || console.warn("There has been an error:", e, "while loading this source:", t)
}, Curtains.BasePlane.prototype._getTextureFromCache = function(t) {
    var e = !1;
    if (this._curtains._imageCache.length > 0)
        for (var i = 0; i < this._curtains._imageCache.length; i++) {
            var s = this._curtains._imageCache[i];
            s.source && "image" === s.type && s.source.src === t.src && (e = s)
        }
    return e
}, Curtains.BasePlane.prototype.loadImage = function(t) {
    var e = t;
    e.crossOrigin = this.crossOrigin || "anonymous", e.sampler = t.getAttribute("data-sampler") || null;
    var i = this._getTextureFromCache(t);
    if (i) return this.createTexture({
        sampler: e.sampler,
        fromTexture: i
    }), this.images.push(i.source), void this._isPlaneReady();
    var s = this.createTexture({
        sampler: e.sampler
    });
    if (s._onSourceLoadedHandler = s._onSourceLoaded.bind(s, e), e.complete) s._onSourceLoaded(e);
    else if (e.decode) {
        var r = this;
        e.decode().then(s._onSourceLoadedHandler).catch(function() {
            e.addEventListener("load", s._onSourceLoadedHandler, !1), e.addEventListener("error", r._sourceLoadError.bind(r, e), !1)
        })
    } else e.addEventListener("load", s._onSourceLoadedHandler, !1), e.addEventListener("error", this._sourceLoadError.bind(this, e), !1);
    this.images.push(e)
}, Curtains.BasePlane.prototype.loadVideo = function(t) {
    var e = t;
    e.preload = !0, e.muted = !0, e.loop = !0, e.sampler = t.getAttribute("data-sampler") || null, e.crossOrigin = this.crossOrigin || "anonymous";
    var i = this.createTexture({
        sampler: e.sampler
    });
    i._onSourceLoadedHandler = i._onVideoLoadedData.bind(i, e), e.addEventListener("canplaythrough", i._onSourceLoadedHandler, !1), e.addEventListener("error", this._sourceLoadError.bind(this, e), !1), e.readyState >= e.HAVE_FUTURE_DATA && i._onSourceLoaded(e), e.load(), this.videos.push(e)
}, Curtains.BasePlane.prototype.loadCanvas = function(t) {
    var e = t;
    e.sampler = t.getAttribute("data-sampler") || null;
    var i = this.createTexture({
        sampler: e.sampler
    });
    this.canvases.push(e), i._onSourceLoaded(e)
}, Curtains.BasePlane.prototype.loadImages = function(t) {
    for (var e = 0; e < t.length; e++) this.loadImage(t[e])
}, Curtains.BasePlane.prototype.loadVideos = function(t) {
    for (var e = 0; e < t.length; e++) this.loadVideo(t[e])
}, Curtains.BasePlane.prototype.loadCanvases = function(t) {
    for (var e = 0; e < t.length; e++) this.loadCanvas(t[e])
}, Curtains.BasePlane.prototype.playVideos = function() {
    for (var t = 0; t < this.textures.length; t++) {
        var e = this.textures[t];
        if ("video" === e.type) {
            var i = e.source.play(),
                s = this;
            void 0 !== i && i.catch(function(t) {
                s._curtains.productionMode || console.warn("Could not play the video : ", t)
            })
        }
    }
}, Curtains.BasePlane.prototype.mouseToPlaneCoords = function(t, e) {
    var i = this.scale ? this.scale : {
            x: 1,
            y: 1
        },
        s = (this._boundingRect.document.width - this._boundingRect.document.width * i.x) / 2,
        r = (this._boundingRect.document.height - this._boundingRect.document.height * i.y) / 2,
        a = this._boundingRect.document.width * i.x / this._curtains.pixelRatio,
        n = this._boundingRect.document.height * i.y / this._curtains.pixelRatio,
        o = (this._boundingRect.document.top + r) / this._curtains.pixelRatio;
    return {
        x: (t - (this._boundingRect.document.left + s) / this._curtains.pixelRatio) / a * 2 - 1,
        y: 1 - (e - o) / n * 2
    }
}, Curtains.BasePlane.prototype._bindPlaneBuffers = function() {
    var t = this._curtains,
        e = t.gl;
    this._vao ? t._isWebGL2 ? t.gl.bindVertexArray(this._vao) : t._extensions.OES_vertex_array_object.bindVertexArrayOES(this._vao) : (e.enableVertexAttribArray(this._attributes.vertexPosition.location), e.bindBuffer(e.ARRAY_BUFFER, this._geometry.bufferInfos.id), e.vertexAttribPointer(this._attributes.vertexPosition.location, this._geometry.bufferInfos.itemSize, e.FLOAT, !1, 0, 0), e.enableVertexAttribArray(this._attributes.textureCoord.location), e.bindBuffer(e.ARRAY_BUFFER, this._material.bufferInfos.id), e.vertexAttribPointer(this._attributes.textureCoord.location, this._material.bufferInfos.itemSize, e.FLOAT, !1, 0, 0)), t._glState.currentBuffersID = this._definition.buffersID
}, Curtains.BasePlane.prototype._bindPlaneTexture = function(t) {
    var e = this._curtains.gl;
    t._canDraw && (e.activeTexture(e.TEXTURE0 + t.index), e.bindTexture(e.TEXTURE_2D, t._sampler.texture))
}, Curtains.BasePlane.prototype.setRenderTarget = function(t) {
    t && t._type && "RenderTarget" === t._type ? this.target = t : this._curtains.productionMode || console.warn("Could not set the render target because the argument passed is not a RenderTarget class object", t)
}, Curtains.BasePlane.prototype._drawPlane = function() {
    var t = this._curtains,
        e = t.gl;
    if (this._canDraw && (this._onRenderCallback && this._onRenderCallback(), "ShaderPass" === this._type ? this._isScenePass ? t._glState.scenePassIndex + 1 < t._drawStacks.scenePasses.length ? (t._bindFrameBuffer(t.shaderPasses[t._drawStacks.scenePasses[t._glState.scenePassIndex + 1]].target), t._glState.scenePassIndex++) : t._bindFrameBuffer(null) : null === t._glState.scenePassIndex && t._bindFrameBuffer(null) : (this.target ? t._bindFrameBuffer(this.target) : null === t._glState.scenePassIndex && t._bindFrameBuffer(null), this._setPerspectiveMatrix(), this._setMVMatrix()), (this.alwaysDraw || this._shouldDraw) && this.visible)) {
        t._setDepth(this._depthTest), t._setFaceCulling(this.cullFace), t._useProgram(this._usedProgram), this._updateUniforms(), (t._glState.currentBuffersID !== this._definition.buffersID || this.target) && this._bindPlaneBuffers();
        for (var i = 0; i < this.textures.length; i++) this.textures[i]._drawTexture();
        e.drawArrays(e.TRIANGLES, 0, this._geometry.bufferInfos.numberOfItems), this._onAfterRenderCallback && this._onAfterRenderCallback()
    }
}, Curtains.BasePlane.prototype._dispose = function() {
    var t = this._curtains.gl;
    if (t) {
        this._vao && (this._curtains._isWebGL2 ? t.deleteVertexArray(this._vao) : this._curtains._extensions.OES_vertex_array_object.deleteVertexArrayOES(this._vao)), this._geometry && (t.bindBuffer(t.ARRAY_BUFFER, this._geometry.bufferInfos.id), t.bufferData(t.ARRAY_BUFFER, 1, t.STATIC_DRAW), t.deleteBuffer(this._geometry.bufferInfos.id), this._geometry = null), this._material && (t.bindBuffer(t.ARRAY_BUFFER, this._material.bufferInfos.id), t.bufferData(t.ARRAY_BUFFER, 1, t.STATIC_DRAW), t.deleteBuffer(this._material.bufferInfos.id), this._material = null), this.target && "ShaderPass" === this._type && (this._curtains.removeRenderTarget(this.target), this.textures.shift());
        for (var e = 0; e < this.textures.length; e++) this.textures[e]._dispose();
        this.textures = null
    }
}, Curtains.BasePlane.prototype.onAfterResize = function(t) {
    return t && (this._onAfterResizeCallback = t), this
}, Curtains.BasePlane.prototype.onLoading = function(t) {
    return t && (this._onPlaneLoadingCallback = t), this
}, Curtains.BasePlane.prototype.onReady = function(t) {
    return t && (this._onReadyCallback = t), this
}, Curtains.BasePlane.prototype.onRender = function(t) {
    return t && (this._onRenderCallback = t), this
}, Curtains.BasePlane.prototype.onAfterRender = function(t) {
    return t && (this._onAfterRenderCallback = t), this
}, Curtains.Plane = function(t, e, i) {
    this._type = "Plane", Curtains.BasePlane.call(this, t, e, i), this.index = this._curtains.planes.length, this._canDraw = !1, this.target = null, i || (i = {}), this._setInitParams(i), this._usedProgram ? (this._curtains._stackPlane(this), this._initPositions(), this._initSources()) : this._curtains._onErrorCallback && this._curtains._onErrorCallback()
}, Curtains.Plane.prototype = Object.create(Curtains.BasePlane.prototype), Curtains.Plane.prototype.constructor = Curtains.Plane, Curtains.Plane.prototype._setInitParams = function(t) {
    this.alwaysDraw = t.alwaysDraw || !1, this._transparent = t.transparent || !1;
    var e = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    t.drawCheckMargins && (e = t.drawCheckMargins), this.drawCheckMargins = e, this._initTransformValues(), this.autoloadSources = t.autoloadSources, null !== this.autoloadSources && void 0 !== this.autoloadSources || (this.autoloadSources = !0), this._fov = t.fov || 50, this._nearPlane = .1, this._farPlane = 150, null === t.watchScroll || void 0 === t.watchScroll ? this.watchScroll = this._curtains._watchScroll : this.watchScroll = t.watchScroll || !1, this.watchScroll && (this._curtains._scrollManager.shouldWatch = !0)
}, Curtains.Plane.prototype._initTransformValues = function() {
    this.rotation = {
        x: 0,
        y: 0,
        z: 0
    }, this.quaternion = new Float32Array([0, 0, 0, 1]), this.relativeTranslation = {
        x: 0,
        y: 0,
        z: 0
    }, this._translation = {
        x: 0,
        y: 0,
        z: 0
    }, this.scale = {
        x: 1,
        y: 1
    }, this.transformOrigin = {
        x: .5,
        y: .5,
        z: 0
    }
}, Curtains.Plane.prototype._initPositions = function() {
    this._initMatrices(), this.setPerspective(this._fov, this._nearPlane, this._farPlane), this._applyWorldPositions()
}, Curtains.Plane.prototype._initSources = function() {
    if (this.autoloadSources) {
        for (var t = [], e = 0; e < this.htmlElement.getElementsByTagName("img").length; e++) t.push(this.htmlElement.getElementsByTagName("img")[e]);
        t.length > 0 && this.loadSources(t);
        var i = [];
        for (e = 0; e < this.htmlElement.getElementsByTagName("video").length; e++) i.push(this.htmlElement.getElementsByTagName("video")[e]);
        i.length > 0 && this.loadSources(i);
        var s = [];
        for (e = 0; e < this.htmlElement.getElementsByTagName("canvas").length; e++) s.push(this.htmlElement.getElementsByTagName("canvas")[e]);
        s.length > 0 && this.loadSources(s), this._loadingManager.initSourcesToLoad = t.length + i.length + s.length
    }
    0 === this._loadingManager.initSourcesToLoad && (this._isPlaneReady(), this._curtains.productionMode || console.warn("This plane does not contain any image, video or canvas element. You may want to add some later with the loadSource() or loadSources() method.")), this._canDraw = !0, this._curtains.needRender(), this.alwaysDraw || this._shouldDrawCheck()
}, Curtains.Plane.prototype._initMatrices = function() {
    var t = this._curtains.gl;
    this._matrices = {
        mvMatrix: {
            name: "uMVMatrix",
            matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            location: t.getUniformLocation(this._usedProgram.program, "uMVMatrix")
        },
        pMatrix: {
            name: "uPMatrix",
            matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
            location: t.getUniformLocation(this._usedProgram.program, "uPMatrix")
        }
    }
}, Curtains.Plane.prototype.resetPlane = function(t) {
    this._initTransformValues(), null !== t && t ? (this.htmlElement = t, this.updatePosition()) : t || this._curtains.productionMode || console.warn("You are trying to reset a plane with a HTML element that does not exist. The old HTML element will be kept instead.")
}, Curtains.Plane.prototype._setWorldSizes = function() {
    var t = this._curtains,
        e = this._boundingRect.document.width / 2 + this._boundingRect.document.left,
        i = this._boundingRect.document.height / 2 + this._boundingRect.document.top,
        s = t._boundingRect.width / 2 + t._boundingRect.left,
        r = t._boundingRect.height / 2 + t._boundingRect.top;
    this._boundingRect.world = {
        width: this._boundingRect.document.width / t._boundingRect.width,
        height: this._boundingRect.document.height / t._boundingRect.height,
        top: (r - i) / t._boundingRect.height,
        left: (e - s) / t._boundingRect.height
    }, this._boundingRect.world.scale = {
        x: this._curtains._boundingRect.width / this._curtains._boundingRect.height * this._boundingRect.world.width / 2,
        y: this._boundingRect.world.height / 2
    }
}, Curtains.Plane.prototype._setPerspectiveMatrix = function() {
    if (this._updatePerspectiveMatrix) {
        var t = this._curtains._boundingRect.width / this._curtains._boundingRect.height,
            e = this._nearPlane * Math.tan(Math.PI / 180 * .5 * this._fov),
            i = 2 * e,
            s = t * i,
            r = -.5 * s,
            a = r + s,
            n = e - i,
            o = 2 * this._nearPlane / (a - r),
            h = 2 * this._nearPlane / (e - n),
            u = (a + r) / (a - r),
            l = (e + n) / (e - n),
            _ = -(this._farPlane + this._nearPlane) / (this._farPlane - this._nearPlane),
            c = -2 * this._farPlane * this._nearPlane / (this._farPlane - this._nearPlane);
        this._matrices.pMatrix.matrix = new Float32Array([o, 0, 0, 0, 0, h, 0, 0, u, l, _, -1, 0, 0, c, 0])
    }(this.shareProgram || !this.shareProgram && this._updatePerspectiveMatrix) && (this._curtains._useProgram(this._usedProgram), this._curtains.gl.uniformMatrix4fv(this._matrices.pMatrix.location, !1, this._matrices.pMatrix.matrix)), this._updatePerspectiveMatrix = !1
}, Curtains.Plane.prototype.setPerspective = function(t, e, i) {
    var s = isNaN(t) ? this._fov : parseFloat(t);
    (s = Math.max(1, Math.min(s, 179))) !== this._fov && (this._fov = s), this._cameraZPosition = 2 * Math.tan(Math.PI / 180 * .5 * this._fov), this._CSSPerspective = Math.pow(Math.pow(this._curtains._boundingRect.width / (2 * this._curtains.pixelRatio), 2) + Math.pow(this._curtains._boundingRect.height / (2 * this._curtains.pixelRatio), 2), .5) / Math.tan(this._fov / 2 * Math.PI / 180), this._nearPlane = isNaN(e) ? this._nearPlane : parseFloat(e), this._nearPlane = Math.max(this._nearPlane, .01), this._farPlane = isNaN(i) ? this._farPlane : parseFloat(i), this._farPlane = Math.max(this._farPlane, 50), this._updatePerspectiveMatrix = !0, this._updateMVMatrix = !0
}, Curtains.Plane.prototype._setMVMatrix = function() {
    if (this._updateMVMatrix) {
        this._translation.z = this.relativeTranslation.z / this._CSSPerspective;
        var t = {
                x: this._translation.x,
                y: this._translation.y,
                z: -(1 - this._translation.z) / this._cameraZPosition
            },
            e = {
                x: 2 * this.transformOrigin.x - 1,
                y: -(2 * this.transformOrigin.y - 1)
            },
            i = {
                x: e.x * this._boundingRect.world.scale.x,
                y: e.y * this._boundingRect.world.scale.y,
                z: this.transformOrigin.z
            },
            s = this._curtains._composeMatrixFromOrigin(t, this.quaternion, this.scale, i),
            r = new Float32Array([this._boundingRect.world.scale.x, 0, 0, 0, 0, this._boundingRect.world.scale.y, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this._matrices.mvMatrix.matrix = this._curtains._multiplyMatrix(s, r), this._matrices.mVPMatrix = this._curtains._multiplyMatrix(this._matrices.pMatrix.matrix, this._matrices.mvMatrix.matrix), this.alwaysDraw || this._shouldDrawCheck()
    }(this.shareProgram || !this.shareProgram && this._updateMVMatrix) && (this._curtains._useProgram(this._usedProgram), this._curtains.gl.uniformMatrix4fv(this._matrices.mvMatrix.location, !1, this._matrices.mvMatrix.matrix)), this._updateMVMatrix = !1
}, Curtains.Plane.prototype.setScale = function(t, e) {
    if (t = isNaN(t) ? this.scale.x : parseFloat(t), e = isNaN(e) ? this.scale.y : parseFloat(e), t = Math.max(t, .001), e = Math.max(e, .001), t !== this.scale.x || e !== this.scale.y) {
        this.scale = {
            x: t,
            y: e
        };
        for (var i = 0; i < this.textures.length; i++) this.textures[i].resize();
        this._updateMVMatrix = !0
    }
}, Curtains.Plane.prototype.setRotation = function(t, e, i) {
    t = isNaN(t) ? this.rotation.x : parseFloat(t), e = isNaN(e) ? this.rotation.y : parseFloat(e), i = isNaN(i) ? this.rotation.z : parseFloat(i), t === this.rotation.x && e === this.rotation.y && i === this.rotation.z || (this.rotation = {
        x: t,
        y: e,
        z: i
    }, this._setQuaternion(), this._updateMVMatrix = !0)
}, Curtains.Plane.prototype._setQuaternion = function() {
    var t = .5 * this.rotation.x,
        e = .5 * this.rotation.y,
        i = .5 * this.rotation.z,
        s = Math.sin(t),
        r = Math.cos(t),
        a = Math.sin(e),
        n = Math.cos(e),
        o = Math.sin(i),
        h = Math.cos(i);
    this.quaternion[0] = s * n * h + r * a * o, this.quaternion[1] = r * a * h - s * n * o, this.quaternion[2] = r * n * o + s * a * h, this.quaternion[3] = r * n * h - s * a * o
}, Curtains.Plane.prototype.setTransformOrigin = function(t, e, i) {
    t = isNaN(t) ? this.transformOrigin.x : parseFloat(t), e = isNaN(e) ? this.transformOrigin.y : parseFloat(e), i = isNaN(i) ? this.transformOrigin.z : parseFloat(i), t === this.transformOrigin.x && e === this.transformOrigin.y && i === this.transformOrigin.z || (this.transformOrigin = {
        x: t,
        y: e,
        z: i
    }, this._updateMVMatrix = !0)
}, Curtains.Plane.prototype._setTranslation = function() {
    var t = {
        x: 0,
        y: 0,
        z: 0
    };
    0 === this.relativeTranslation.x && 0 === this.relativeTranslation.y && 0 === this.relativeTranslation.z || (t = this._documentToLocalSpace(this.relativeTranslation.x, this.relativeTranslation.y)), this._translation.x = this._boundingRect.world.left + t.x, this._translation.y = this._boundingRect.world.top + t.y, this._updateMVMatrix = !0
}, Curtains.Plane.prototype.setRelativePosition = function(t, e, i) {
    t = isNaN(t) ? this.relativeTranslation.x : parseFloat(t), e = isNaN(e) ? this.relativeTranslation.y : parseFloat(e), i = isNaN(i) ? this.relativeTranslation.z : parseFloat(i), t === this.relativeTranslation.x && e === this.relativeTranslation.y && i === this.relativeTranslation.z || (this.relativeTranslation = {
        x: t,
        y: e,
        z: i
    }, this._setTranslation())
}, Curtains.Plane.prototype._documentToLocalSpace = function(t, e) {
    return {
        x: t / (this._curtains._boundingRect.width / this._curtains.pixelRatio) * (this._curtains._boundingRect.width / this._curtains._boundingRect.height),
        y: -e / (this._curtains._boundingRect.height / this._curtains.pixelRatio)
    }
}, Curtains.Plane.prototype._shouldDrawCheck = function() {
    var t = this._getWebGLDrawRect(),
        e = this;
    Math.round(t.right) <= this._curtains._boundingRect.left || Math.round(t.left) >= this._curtains._boundingRect.left + this._curtains._boundingRect.width || Math.round(t.bottom) <= this._curtains._boundingRect.top || Math.round(t.top) >= this._curtains._boundingRect.top + this._curtains._boundingRect.height ? this._shouldDraw && (this._shouldDraw = !1, setTimeout(function() {
        e._onLeaveViewCallback && e._onLeaveViewCallback()
    }, 0)) : (this._shouldDraw || setTimeout(function() {
        e._onReEnterViewCallback && e._onReEnterViewCallback()
    }, 0), this._shouldDraw = !0)
}, Curtains.Plane.prototype.isDrawn = function() {
    return this._canDraw && this.visible && (this._shouldDraw || this.alwaysDraw)
}, Curtains.Plane.prototype._applyWorldPositions = function() {
    this._setWorldSizes(), this._setTranslation()
}, Curtains.Plane.prototype.updatePosition = function() {
    this._setDocumentSizes(), this._applyWorldPositions()
}, Curtains.Plane.prototype.updateScrollPosition = function() {
    (this._curtains._scrollManager.lastXDelta || this._curtains._scrollManager.lastYDelta) && (this._boundingRect.document.top += this._curtains._scrollManager.lastYDelta * this._curtains.pixelRatio, this._boundingRect.document.left += this._curtains._scrollManager.lastXDelta * this._curtains.pixelRatio, this._applyWorldPositions())
}, Curtains.Plane.prototype.enableDepthTest = function(t) {
    this._depthTest = t
}, Curtains.Plane.prototype.moveToFront = function() {
    this.enableDepthTest(!1);
    for (var t = this._transparent ? "transparent" : "opaque", e = this._curtains._drawStacks[t].programs["program-" + this._usedProgram.id], i = 0; i < e.length; i++) this.index === e[i] && e.splice(i, 1);
    "transparent" === t ? e.unshift(this.index) : e.push(this.index), this._curtains._drawStacks[t].programs["program-" + this._usedProgram.id] = e;
    for (i = 0; i < this._curtains._drawStacks[t].order.length; i++) this._curtains._drawStacks[t].order[i] === this._usedProgram.id && this._curtains._drawStacks[t].order.splice(i, 1);
    this._curtains._drawStacks[t].order.push(this._usedProgram.id)
}, Curtains.Plane.prototype.onReEnterView = function(t) {
    return t && (this._onReEnterViewCallback = t), this
}, Curtains.Plane.prototype.onLeaveView = function(t) {
    return t && (this._onLeaveViewCallback = t), this
}, Curtains.RenderTarget = function(t, e) {
    e || (e = {}), this._curtains = t, this.index = this._curtains.renderTargets.length, this._type = "RenderTarget", this._shaderPass = e.shaderPass || null, this._depth = e.depth || !1, this._shouldClear = e.clear, null !== this._shouldClear && void 0 !== this._shouldClear || (this._shouldClear = !0), this._minSize = {
        width: e.minWidth || 1024 * this._curtains.pixelRatio,
        height: e.minHeight || 1024 * this._curtains.pixelRatio
    }, this.userData = {}, this.uuid = this._curtains._generateUUID(), this._curtains.renderTargets.push(this), this._initRenderTarget()
}, Curtains.RenderTarget.prototype._initRenderTarget = function() {
    this._setSize(), this.textures = [], this._createFrameBuffer()
}, Curtains.RenderTarget.prototype._setSize = function() {
    this._shaderPass && this._shaderPass._isScenePass ? this._size = {
        width: this._curtains._boundingRect.width,
        height: this._curtains._boundingRect.height
    } : this._size = {
        width: Math.max(this._minSize.width, this._curtains._boundingRect.width),
        height: Math.max(this._minSize.height, this._curtains._boundingRect.height)
    }
}, Curtains.RenderTarget.prototype.resize = function() {
    this._shaderPass && this._shaderPass._isScenePass && (this._setSize(), this._curtains._bindFrameBuffer(this, !0), this._depth && this._bindDepthBuffer(), this._curtains._bindFrameBuffer(null))
}, Curtains.RenderTarget.prototype._bindDepthBuffer = function() {
    var t = this._curtains.gl;
    this._depthBuffer && (t.bindRenderbuffer(t.RENDERBUFFER, this._depthBuffer), t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_COMPONENT16, this._size.width, this._size.height), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, this._depthBuffer))
}, Curtains.RenderTarget.prototype._createFBOTexture = function() {
    var t = this._curtains.gl;
    if (this.textures.length > 0) this.textures[0]._canDraw = !1, this.textures[0]._init();
    else {
        var e = new Curtains.Texture(this._shaderPass ? this._shaderPass : this, {
            index: this.textures.length,
            sampler: "uRenderTexture",
            isFBOTexture: !0
        });
        this.textures.push(e)
    }
    t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.textures[0]._sampler.texture, 0)
}, Curtains.RenderTarget.prototype._createFrameBuffer = function() {
    var t = this._curtains.gl;
    this._frameBuffer = t.createFramebuffer(), this._curtains._bindFrameBuffer(this, !0), this._createFBOTexture(), this._depth && (this._depthBuffer = t.createRenderbuffer(), this._bindDepthBuffer()), this._curtains._bindFrameBuffer(null)
}, Curtains.RenderTarget.prototype._restoreContext = function() {
    this._shaderPass && this._shaderPass._isScenePass || (this._shaderPass = null, this._createFrameBuffer())
}, Curtains.RenderTarget.prototype._dispose = function() {
    this._frameBuffer && (this._curtains.gl.deleteFramebuffer(this._frameBuffer), this._frameBuffer = null), this._depthBuffer && (this._curtains.gl.deleteRenderbuffer(this._depthBuffer), this._depthBuffer = null), this.textures[0]._dispose(), this.textures = []
}, Curtains.ShaderPass = function(t, e) {
    e || (e = {}), e.widthSegments = 1, e.heightSegments = 1, this._type = "ShaderPass", this._isScenePass = !0, Curtains.BasePlane.call(this, t, t.container, e), this.index = this._curtains.shaderPasses.length, this._depth = e.depth || !1, this._shouldClear = e.clear, null !== this._shouldClear && void 0 !== this._shouldClear || (this._shouldClear = !0), this.target = e.renderTarget || null, this.target && (this._isScenePass = !1, this._shouldClear = this.target._shouldClear), this._usedProgram && this._initShaderPassPlane()
}, Curtains.ShaderPass.prototype = Object.create(Curtains.BasePlane.prototype), Curtains.ShaderPass.prototype.constructor = Curtains.ShaderPass, Curtains.ShaderPass.prototype._initShaderPassPlane = function() {
    if (this.target) {
        this.setRenderTarget(this.target), this.target._shaderPass = this;
        var t = new Curtains.Texture(this, {
            index: this.textures.length,
            sampler: "uRenderTexture",
            isFBOTexture: !0,
            fromTexture: this.target.textures[0]
        });
        this.textures.push(t)
    } else this._createFrameBuffer();
    this._isPlaneReady(), this._canDraw = !0, this._curtains.needRender()
}, Curtains.ShaderPass.prototype._getDefaultVS = function(t) {
    return "precision mediump float;\nattribute vec3 aVertexPosition;attribute vec2 aTextureCoord;varying vec3 vVertexPosition;varying vec2 vTextureCoord;void main() {vTextureCoord = aTextureCoord;vVertexPosition = aVertexPosition;gl_Position = vec4(aVertexPosition, 1.0);}"
}, Curtains.ShaderPass.prototype._getDefaultFS = function(t) {
    return "precision mediump float;\nvarying vec3 vVertexPosition;varying vec2 vTextureCoord;uniform sampler2D uRenderTexture;void main( void ) {gl_FragColor = texture2D(uRenderTexture, vTextureCoord);}"
}, Curtains.ShaderPass.prototype._createFrameBuffer = function() {
    var t = new Curtains.RenderTarget(this._curtains, {
        shaderPass: this,
        clear: this._shouldClear,
        depth: this._depth
    });
    this.setRenderTarget(t), this.textures.push(this.target.textures[0])
}, Curtains.Texture = function(t, e) {
    if (this._parent = t, this._curtains = t._curtains, this.uuid = this._curtains._generateUUID(), t._usedProgram || e.isFBOTexture) return this.index = t.textures.length, this._sampler = {
        isActive: !1,
        name: e.sampler || "uSampler" + this.index
    }, this._textureMatrix = {
        name: e.sampler ? e.sampler + "Matrix" : "uTextureMatrix" + this.index,
        matrix: null
    }, this._willUpdate = !1, this.shouldUpdate = !1, this._forceUpdate = !1, this.scale = {
        x: 1,
        y: 1
    }, this.userData = {}, this.type = e.isFBOTexture ? "fboTexture" : "empty", this._canDraw = !1, e.fromTexture ? (this._initFromTexture = !0, this._parent._usedProgram && this._setTextureUniforms(), void this.setFromTexture(e.fromTexture)) : (this._initFromTexture = !1, this._init(), this);
    this._curtains.productionMode || console.warn("Unable to create the texture because the program is not valid")
}, Curtains.Texture.prototype._init = function() {
    var t = this._curtains.gl;
    if (this._sampler.texture = t.createTexture(), this._internalFormat = t.RGBA, this._format = t.RGBA, this._textureType = t.UNSIGNED_BYTE, this._texParameters = !1, this._flipY = !1, t.bindTexture(t.TEXTURE_2D, this._sampler.texture), this._curtains._glState.flipY && (this._curtains._glState.flipY = this._flipY, t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, this._flipY)), t.pixelStorei(t.UNPACK_ALIGNMENT, 4), t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), this._parent._usedProgram) {
        if (this._size = {
                width: this._parent._boundingRect.document.width,
                height: this._parent._boundingRect.document.height
            }, this._setTextureUniforms(), "empty" === this.type) t.texImage2D(t.TEXTURE_2D, 0, this._internalFormat, 1, 1, 0, this._format, this._textureType, new Uint8Array([0, 0, 0, 255])), this._sourceLoaded = !1;
        else if (!this.source) {
            var e = this._getSizes();
            this._updateTextureMatrix(e)
        }
    } else this._size = {
        width: this._parent._size.width || this._curtains._boundingRect.width,
        height: this._parent._size.height || this._curtains._boundingRect.height
    };
    "fboTexture" === this.type && (this._curtains._isWebGL2 && this._curtains._extensions.EXT_color_buffer_float ? (this._internalFormat = t.RGBA16F, this._textureType = t.HALF_FLOAT) : this._curtains._extensions.OES_texture_half_float && (this._textureType = this._curtains._extensions.OES_texture_half_float.HALF_FLOAT_OES), t.texImage2D(t.TEXTURE_2D, 0, this._internalFormat, this._size.width, this._size.height, 0, this._format, this._textureType, null), this._setMipmaps()), this._canDraw = !0
}, Curtains.Texture.prototype._setTextureUniforms = function() {
    for (var t = 0; t < this._parent._activeTextures.length; t++) this._parent._activeTextures[t].name === this._sampler.name && (this._sampler.isActive = !0, this._sampler.location = this._curtains.gl.getUniformLocation(this._parent._usedProgram.program, this._sampler.name), this._textureMatrix.location = this._curtains.gl.getUniformLocation(this._parent._usedProgram.program, this._textureMatrix.name), this._curtains._useProgram(this._parent._usedProgram), this._curtains.gl.uniform1i(this._sampler.location, this.index))
}, Curtains.Texture.prototype.setFromTexture = function(t) {
    if (t) {
        if (this.type = t.type, this._sampler.texture = t._sampler.texture, this.source = t.source, this._size = t._size, this._sourceLoaded = t._sourceLoaded, this._internalFormat = t._internalFormat, this._format = t._format, this._textureType = t._textureType, this._texParameters = t._texParameters, this._originalTexture = t, this._parent._usedProgram && (!this._canDraw || !this._textureMatrix.matrix)) {
            var e = this._getSizes();
            this._updateTextureMatrix(e), this._canDraw = !0
        }
    } else this._curtains.productionMode || console.warn("Unable to set the texture from texture:", t)
}, Curtains.Texture.prototype.setSource = function(t) {
    if (this._parent._usedProgram) {
        this.source = t, "empty" === this.type && ("IMG" === t.tagName.toUpperCase() ? this.type = "image" : "VIDEO" === t.tagName.toUpperCase() ? (this.type = "video", this.shouldUpdate = !0) : "CANVAS" === t.tagName.toUpperCase() ? (this.type = "canvas", this._willUpdate = !0, this.shouldUpdate = !0) : this._curtains.productionMode || console.warn("this HTML tag could not be converted into a texture:", t.tagName)), this._size = {
            width: this.source.naturalWidth || this.source.width || this.source.videoWidth,
            height: this.source.naturalHeight || this.source.height || this.source.videoHeight
        }, this._sourceLoaded = !0;
        var e = this._curtains.gl;
        e.activeTexture(e.TEXTURE0 + this.index), e.bindTexture(e.TEXTURE_2D, this._sampler.texture), this._curtains.premultipliedAlpha && e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), this._flipY = !0, this._curtains._glState.flipY || (this._curtains._glState.flipY = this._flipY, e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, this._flipY)), this.resize(), "image" === this.type && (e.texImage2D(e.TEXTURE_2D, 0, this._internalFormat, this._format, this._textureType, t), this._setMipmaps()), this._curtains.needRender()
    } else this._curtains.productionMode || console.warn("Unable to set the texture source because the program is not valid")
}, Curtains.Texture.prototype._setMipmaps = function() {
    var t = this._curtains.gl;
    t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), this._curtains._isWebGL2 && "image" === this.type ? (t.generateMipmap(t.TEXTURE_2D), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR_MIPMAP_NEAREST)) : t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), this._texParameters = !0
}, Curtains.Texture.prototype.needUpdate = function() {
    this._forceUpdate = !0
}, Curtains.Texture.prototype._update = function() {
    var t = this._curtains.gl;
    this.source ? (t.texImage2D(t.TEXTURE_2D, 0, this._internalFormat, this._format, this._textureType, this.source), this._texParameters || this._setMipmaps()) : t.texImage2D(t.TEXTURE_2D, 0, this._internalFormat, this._size.width, this._size.height, 0, this._format, this._textureType, this.source)
}, Curtains.Texture.prototype._getSizes = function() {
    var t = this._parent.scale ? this._parent.scale : {
            x: 1,
            y: 1
        },
        e = this._parent._boundingRect.document.width * t.x,
        i = this._parent._boundingRect.document.height * t.y,
        s = this._size.width,
        r = this._size.height,
        a = s / r,
        n = e / i,
        o = 0,
        h = 0;
    return n > a ? h = Math.min(0, i - e * (1 / a)) : n < a && (o = Math.min(0, e - i * a)), {
        parentWidth: e,
        parentHeight: i,
        sourceWidth: s,
        sourceHeight: r,
        xOffset: o,
        yOffset: h
    }
}, Curtains.Texture.prototype.setScale = function(t, e) {
    t = isNaN(t) ? this.scale.x : parseFloat(t), e = isNaN(e) ? this.scale.y : parseFloat(e), t = Math.max(t, .001), e = Math.max(e, .001), t === this.scale.x && e === this.scale.y || (this.scale = {
        x: t,
        y: e
    }, this.resize())
}, Curtains.Texture.prototype.resize = function() {
    if ("fboTexture" === this.type) {
        var t = this._curtains.gl;
        this._size = {
            width: this._parent._boundingRect.document.width,
            height: this._parent._boundingRect.document.height
        }, this._originalTexture || (t.bindTexture(t.TEXTURE_2D, this._parent.textures[0]._sampler.texture), t.texImage2D(t.TEXTURE_2D, 0, this._internalFormat, this._size.width, this._size.height, 0, this._format, this._textureType, this.source))
    } else this.source && (this._size = {
        width: this.source.naturalWidth || this.source.width || this.source.videoWidth,
        height: this.source.naturalHeight || this.source.height || this.source.videoHeight
    });
    if (this._parent._usedProgram) {
        var e = this._getSizes();
        this._updateTextureMatrix(e)
    }
}, Curtains.Texture.prototype._updateTextureMatrix = function(t) {
    var e = {
        x: t.parentWidth / (t.parentWidth - t.xOffset),
        y: t.parentHeight / (t.parentHeight - t.yOffset)
    };
    e.x /= this.scale.x, e.y /= this.scale.y;
    var i = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, (1 - e.x) / 2, (1 - e.y) / 2, 0, 1]);
    this._textureMatrix.matrix = this._curtains._scaleMatrix(i, e.x, e.y, 1), this._curtains._useProgram(this._parent._usedProgram), this._curtains.gl.uniformMatrix4fv(this._textureMatrix.location, !1, this._textureMatrix.matrix)
}, Curtains.Texture.prototype._onSourceLoaded = function(t) {
    this._parent._loadingManager.sourcesLoaded++;
    var e = this;
    if (this._sourceLoaded || setTimeout(function() {
            e._parent._onPlaneLoadingCallback && e._parent._onPlaneLoadingCallback(e)
        }, 0), this.setSource(t), this._parent._isPlaneReady(), "image" === this.type) {
        for (var i = !0, s = 0; s < this._curtains._imageCache.length; s++) this._curtains._imageCache[s].source && this._curtains._imageCache[s].source.src === t.src && (i = !1);
        i && this._curtains._imageCache.push(this)
    }
}, Curtains.Texture.prototype._onVideoLoadedData = function(t) {
    this._sourceLoaded || this._onSourceLoaded(t)
}, Curtains.Texture.prototype._drawTexture = function() {
    this._sampler.isActive && (this._parent._bindPlaneTexture(this), this._flipY && !this._curtains._glState.flipY && (this._curtains._glState.flipY = this._flipY, this._curtains.gl.pixelStorei(this._curtains.gl.UNPACK_FLIP_Y_WEBGL, this._flipY)), "video" === this.type && this.source && this.source.readyState >= this.source.HAVE_CURRENT_DATA && (this._willUpdate = !0), (this._forceUpdate || this._willUpdate && this.shouldUpdate) && this._update(), "video" === this.type && (this._willUpdate = !1), this._forceUpdate = !1)
}, Curtains.Texture.prototype._restoreFromTexture = function() {
    this._initFromTexture ? this._setTextureUniforms() : this._init(), this.setFromTexture(this._originalTexture)
}, Curtains.Texture.prototype._restoreContext = function() {
    if (this._canDraw = !1, this._sampler.isActive = !1, this._originalTexture) {
        var t = this;
        if (this._originalTexture._canDraw) setTimeout(function() {
            t._restoreFromTexture()
        }, 0);
        else var e = setInterval(function() {
            t._originalTexture._canDraw && (t._restoreFromTexture(), clearInterval(e))
        }, 16)
    } else this._init(), this.source && ("image" === this.type && this._curtains._imageCache.push(this), this.setSource(this.source), this.needUpdate())
}, Curtains.Texture.prototype._dispose = function() {
    "video" === this.type ? (this.source.removeEventListener("canplaythrough", this._onSourceLoadedHandler, !1), this.source.removeEventListener("error", this._parent._sourceLoadError, !1), this.source.pause(), this.source.removeAttribute("src"), this.source.load(), this.source = null) : "canvas" === this.type ? (this.source.width = this.source.width, this.source = null) : "image" === this.type && this._curtains._isDestroying && (this.source.removeEventListener("load", this._onSourceLoadedHandler, !1), this.source.removeEventListener("error", this._parent._sourceLoadError, !1), this.source = null);
    var t = this._curtains.gl;
    t && !this._originalTexture && ("image" !== this.type || this._curtains._isDestroying) && (t.activeTexture(t.TEXTURE0 + this.index), t.bindTexture(t.TEXTURE_2D, null), t.deleteTexture(this._sampler.texture)), this._parent._loadingManager && this._parent._loadingManager.sourcesLoaded--
};