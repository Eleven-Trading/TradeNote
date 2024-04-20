"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
codemirror_1.default.defineOption('jump', false, function (cm, options, old) {
    if (old && old !== codemirror_1.default.Init) {
        var oldOnMouseOver = cm.state.jump.onMouseOver;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseover', oldOnMouseOver);
        var oldOnMouseOut = cm.state.jump.onMouseOut;
        codemirror_1.default.off(cm.getWrapperElement(), 'mouseout', oldOnMouseOut);
        codemirror_1.default.off(document, 'keydown', cm.state.jump.onKeyDown);
        delete cm.state.jump;
    }
    if (options) {
        var state = (cm.state.jump = {
            options: options,
            onMouseOver: onMouseOver.bind(null, cm),
            onMouseOut: onMouseOut.bind(null, cm),
            onKeyDown: onKeyDown.bind(null, cm),
        });
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseover', state.onMouseOver);
        codemirror_1.default.on(cm.getWrapperElement(), 'mouseout', state.onMouseOut);
        codemirror_1.default.on(document, 'keydown', state.onKeyDown);
    }
});
function onMouseOver(cm, event) {
    var target = event.target || event.srcElement;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    if ((target === null || target === void 0 ? void 0 : target.nodeName) !== 'SPAN') {
        return;
    }
    var box = target.getBoundingClientRect();
    var cursor = {
        left: (box.left + box.right) / 2,
        top: (box.top + box.bottom) / 2,
    };
    cm.state.jump.cursor = cursor;
    if (cm.state.jump.isHoldingModifier) {
        enableJumpMode(cm);
    }
}
function onMouseOut(cm) {
    if (!cm.state.jump.isHoldingModifier && cm.state.jump.cursor) {
        cm.state.jump.cursor = null;
        return;
    }
    if (cm.state.jump.isHoldingModifier && cm.state.jump.marker) {
        disableJumpMode(cm);
    }
}
function onKeyDown(cm, event) {
    if (cm.state.jump.isHoldingModifier || !isJumpModifier(event.key)) {
        return;
    }
    cm.state.jump.isHoldingModifier = true;
    if (cm.state.jump.cursor) {
        enableJumpMode(cm);
    }
    var onKeyUp = function (upEvent) {
        if (upEvent.code !== event.code) {
            return;
        }
        cm.state.jump.isHoldingModifier = false;
        if (cm.state.jump.marker) {
            disableJumpMode(cm);
        }
        codemirror_1.default.off(document, 'keyup', onKeyUp);
        codemirror_1.default.off(document, 'click', onClick);
        cm.off('mousedown', onMouseDown);
    };
    var onClick = function (clickEvent) {
        var _a = cm.state.jump, destination = _a.destination, options = _a.options;
        if (destination) {
            options.onClick(destination, clickEvent);
        }
    };
    var onMouseDown = function (_, downEvent) {
        if (cm.state.jump.destination) {
            downEvent.codemirrorIgnore = true;
        }
    };
    codemirror_1.default.on(document, 'keyup', onKeyUp);
    codemirror_1.default.on(document, 'click', onClick);
    cm.on('mousedown', onMouseDown);
}
var isMac = typeof navigator !== 'undefined' &&
    navigator &&
    navigator.appVersion.includes('Mac');
function isJumpModifier(key) {
    return key === (isMac ? 'Meta' : 'Control');
}
function enableJumpMode(cm) {
    if (cm.state.jump.marker) {
        return;
    }
    var _a = cm.state.jump, cursor = _a.cursor, options = _a.options;
    var pos = cm.coordsChar(cursor);
    var token = cm.getTokenAt(pos, true);
    var getDestination = options.getDestination || cm.getHelper(pos, 'jump');
    if (getDestination) {
        var destination = getDestination(token, options, cm);
        if (destination) {
            var marker = cm.markText({ line: pos.line, ch: token.start }, { line: pos.line, ch: token.end }, { className: 'CodeMirror-jump-token' });
            cm.state.jump.marker = marker;
            cm.state.jump.destination = destination;
        }
    }
}
function disableJumpMode(cm) {
    var marker = cm.state.jump.marker;
    cm.state.jump.marker = null;
    cm.state.jump.destination = null;
    marker.clear();
}
//# sourceMappingURL=jump-addon.js.map