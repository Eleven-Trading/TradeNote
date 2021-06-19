/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, Gaudenz Alder
 *
 * Usage: DiagramEditor.editElement(elt) where elt is an img or object with
 * a data URI src or data attribute or an svg node with a content attribute.
 *
 * See https://jgraph.github.io/drawio-integration/javascript.html
 */

function DiagramEditor(config, ui, done, initialized)
{
	this.config = (config != null) ? config : this.config;
	this.ui = (ui != null) ? ui : this.ui;
	this.done = (done != null) ? done : this.done;
  this.initialized = (initialized != null) ? initialized : this.initialized;

	var self = this;

	this.handleMessageEvent = function(evt)
	{
		if (self.frame != null && evt.source == self.frame.contentWindow &&
			evt.data.length > 0)
		{
			try
			{
				var msg = JSON.parse(evt.data);

				if (msg != null)
				{
					self.handleMessage(msg);
					this.testImg = msg.data
				}
			}
			catch (e)
			{
				console.error(e);
			}
		}
	};
};

/**
 * Static method to edit the diagram in the given img or object.
 */
DiagramEditor.editElement = function(elt, config, ui, done)
{
  if (!elt.diagramEditorStarting)
  {
    elt.diagramEditorStarting = true;

    return new DiagramEditor(config, ui, done, function()
    {
        delete elt.diagramEditorStarting;
    }).editElement(elt);
   }
};

/**
 * Global configuration.
 */
DiagramEditor.prototype.config = null;

/**
 * Protocol and domain to use.
 */
DiagramEditor.prototype.drawDomain = 'https://embed.diagrams.net/';

/**
 * UI theme to be use.
 */
DiagramEditor.prototype.ui = 'min';

/**
 * Contains XML for pending image export.
 */
DiagramEditor.prototype.xml = null;

/**
 * Format to use.
 */
DiagramEditor.prototype.format = 'xml';

/**
 * Specifies if libraries should be enabled.
 */
DiagramEditor.prototype.libraries = true;

/**
 * CSS style for the iframe.
 */
DiagramEditor.prototype.frameStyle = 'position:absolute;border:0;width:100%;height:100%;';

/**
 * Adds the iframe and starts editing.
 */
DiagramEditor.prototype.editElement = function(elem)
{
	var src = this.getElementData(elem);
	this.startElement = elem;
	var fmt = this.format;

	if (src.substring(0, 15) === 'data:image/png;')
	{
		fmt = 'xmlpng';
	}
	else if (src.substring(0, 19) === 'data:image/svg+xml;' ||
		elem.nodeName.toLowerCase() == 'svg')
	{
		fmt = 'xmlsvg';
	}

	this.startEditing(src, fmt);

	return this;
};

/**
 * Adds the iframe and starts editing.
 */
DiagramEditor.prototype.getElementData = function(elem)
{
	var name = elem.nodeName.toLowerCase();

	return elem.getAttribute((name == 'svg') ? 'content' :
		((name == 'img') ? 'src' : 'data'));
};

/**
 * Adds the iframe and starts editing.
 */
DiagramEditor.prototype.setElementData = function(elem, data)
{
	var name = elem.nodeName.toLowerCase();

	if (name == 'svg')
	{
		elem.outerHTML = atob(data.substring(data.indexOf(',') + 1));
	}
	else
	{
		elem.setAttribute((name == 'img') ? 'src' : 'data', data);
	}

	return elem;
};

/**
 * Starts the editor for the given data.
 */
DiagramEditor.prototype.startEditing = function(data, format, title)
{
	if (this.frame == null)
	{
		window.addEventListener('message', this.handleMessageEvent);
		this.format = (format != null) ? format : this.format;
		this.title = (title != null) ? title : this.title;
		this.data = data;

		this.frame = this.createFrame(
			this.getFrameUrl(),
			this.getFrameStyle());
		document.body.appendChild(this.frame);
		this.setWaiting(true);
	}
};

/**
 * Updates the waiting cursor.
 */
DiagramEditor.prototype.setWaiting = function(waiting)
{
	if (this.startElement != null)
	{
		// Redirect cursor to parent for SVG and object
		var elt = this.startElement;
		var name = elt.nodeName.toLowerCase();

		if (name == 'svg' || name == 'object')
		{
			elt = elt.parentNode;
		}

		if (elt != null)
		{
			if (waiting)
			{
				this.frame.style.pointerEvents = 'none';
				this.previousCursor = elt.style.cursor;
				elt.style.cursor = 'wait';
			}
			else
			{
				elt.style.cursor = this.previousCursor;
				this.frame.style.pointerEvents = '';
			}
		}
	}
};

/**
 * Updates the waiting cursor.
 */
DiagramEditor.prototype.setActive = function(active)
{
	if (active)
	{
		this.previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
	else
	{
		document.body.style.overflow = this.previousOverflow;
	}
};

/**
 * Removes the iframe.
 */
DiagramEditor.prototype.stopEditing = function()
{
	if (this.frame != null)
	{
		window.removeEventListener('message', this.handleMessageEvent);
		document.body.removeChild(this.frame);
		this.setActive(false);
		this.frame = null;
	}
};

/**
 * Send the given message to the iframe.
 */
DiagramEditor.prototype.postMessage = function(msg)
{
	if (this.frame != null)
	{
		this.frame.contentWindow.postMessage(JSON.stringify(msg), '*');
	}
};

/**
 * Returns the diagram data.
 */
DiagramEditor.prototype.getData = function()
{
	return this.data;
};

/**
 * Returns the title for the editor.
 */
DiagramEditor.prototype.getTitle = function()
{
	return this.title;
};

/**
 * Returns the CSS style for the iframe.
 */
DiagramEditor.prototype.getFrameStyle = function()
{
	return this.frameStyle + ';left:' +
		document.body.scrollLeft + 'px;top:' +
		document.body.scrollTop + 'px;';
};

/**
 * Returns the URL for the iframe.
 */
DiagramEditor.prototype.getFrameUrl = function()
{
	var url = this.drawDomain + '?proto=json&spin=1';

	if (this.ui != null)
	{
		url += '&ui=' + this.ui;
	}

	if (this.libraries != null)
	{
		url += '&libraries=1';
	}

	if (this.config != null)
	{
		url += '&configure=1';
	}

	return url;
};

/**
 * Creates the iframe.
 */
DiagramEditor.prototype.createFrame = function(url, style)
{
	var frame = document.createElement('iframe');
	frame.setAttribute('frameborder', '0');
	frame.setAttribute('style', style);
	frame.setAttribute('src', url);

	return frame;
};

/**
 * Sets the status of the editor.
 */
DiagramEditor.prototype.setStatus = function(messageKey, modified)
{
	this.postMessage({action: 'status', messageKey: messageKey, modified: modified});
};

/**
 * Handles the given message.
 */
DiagramEditor.prototype.handleMessage = function(msg)
{
	if (msg.event == 'configure')
	{
		this.configureEditor();
	}
	else if (msg.event == 'init')
	{
		this.initializeEditor();
	}
	else if (msg.event == 'autosave')
	{
		this.save(msg.xml, true, this.startElement);
	}
	else if (msg.event == 'export')
	{
    this.setElementData(this.startElement, msg.data);
		this.stopEditing();
    this.xml = null;
	}
	else if (msg.event == 'save')
	{
    this.save(msg.xml, false, this.startElement);
    this.xml = msg.xml;

		if (msg.exit)
		{
			msg.event = 'exit';
		}
    else
    {
      this.setStatus('allChangesSaved', false);
    }
	}

	if (msg.event == 'exit')
	{
		if (this.format != 'xml')
		{
      if (this.xml != null)
      {
			  this.postMessage({action: 'export', format: this.format,
          xml: this.xml, spinKey: 'export'});
      }
      else
      {
      	this.stopEditing(msg);
      }
		}
		else
		{
      if (msg.modified == null || msg.modified)
      {
			  this.save(msg.xml, false, this.startElement);
      }

      this.stopEditing(msg);
		}
	}
};

/**
 * Posts configure message to editor.
 */
DiagramEditor.prototype.configureEditor = function()
{
	this.postMessage({action: 'configure', config: this.config});
};

/**
 * Posts load message to editor.
 */
DiagramEditor.prototype.initializeEditor = function()
{
	this.postMessage({action: 'load',autosave: 1, saveAndExit: '1',
		modified: 'unsavedChanges', xml: this.getData(),
		title: this.getTitle()});
	this.setWaiting(false);
	this.setActive(true);
  this.initialized();
};

/**
 * Saves the given data.
 */
DiagramEditor.prototype.save = function(data, draft, elt)
{
	this.done(data, draft, elt);
};

/**
 * Invoked after save.
 */
DiagramEditor.prototype.done = function()
{
};

/**
 * Invoked after the editor has sent the init message.
 */
DiagramEditor.prototype.initialized = function()
{
	// hook for subclassers
};