/**
 * @class PointOfInterestTeleporter
 */
class PointOfInterestTeleporter {
	/**
	 * Handles on the canvasReady Hook.
	 *
	 * Checks all notes, and adds event listeners for
	 * closing the note context menu. 
	 *
	 * @static
	 * @memberof PointOfInterestTeleporter
	 */
	static onReady() {
		canvas.notes.placeables.forEach(n => this.checkNote(n));

		canvas.mouseInteractionManager.target.on("rightdown", () => canvas.hud.poiTp.clear());
		canvas.mouseInteractionManager.target.on("mousedown", () => canvas.hud.poiTp.clear());

		console.log(game.i18n.localize("poitp.name"), "| Ready.");	
	}

	/**
	 * Handles renderHeadsUpDisplay Hook.
	 *
	 * Creates a new HUD for map notes,
	 * and adds it to the document.
	 *
	 * @static
	 * @param {HeadsUpDisplay} hud - The heads up display container class
	 * @param {jquery} html - The html of the HUD
	 * @memberof PointOfInterestTeleporter
	 */
	static renderHeadsUpDisplay(hud, html) {
		hud.poiTp = new PoiTpHUD();
		const hudTemp = document.createElement("template");
		hudTemp.id = "poi-tp-ctx-menu";
		html.append(hudTemp);
	}

	/**
	 * Handles the createNote Hook.
	 *
	 * @static
	 * @param {NoteDocument} noteDocument - The document associated with the new note
	 * @memberof PointOfInterestTeleporter
	 */
	static createNote(noteDocument) {
		if (noteDocument.object) return this.checkNote(noteDocument.object);
	}

	/**
	 * Handles updateNote Hook.
	 *
	 * @static
	 * @param {NoteDocument} noteDocument - The document associated with the new note
	 * @memberof PointOfInterestTeleporter
	 */
	static updateNote(noteDocument) {
		if (noteDocument.object) return this.checkNote(noteDocument.object);
	}

	/**
	 * Handles the getSceneDirectoryEntryContext Hook.
	 *
	 * Adds a new item to the scene directory context
	 * menu. The new item allows for a new scene note
	 * to be created in one click.
	 *
	 * The new option appears in place of the "Scene Notes"
	 * option in the context menu if the scene doesn't have notes.
	 *
	 * @static
	 * @param {jquery} html - The HTML of the directory tab
	 * @param {object[]} options - An array of objects defining options in the context menu
	 * @memberof PointOfInterestTeleporter
	 */
	static getSceneDirEnCtx(html, options) {
		// Add this option at the third index, so that it appears in the same place that
		// the scene notes option would appear
		options.splice(2, 0, {
			name: "poitp.createNote",
			icon: '<i class="fas fa-scroll"></i>',
			/**
			 * Checks whether or not this option should be shown
			 * 
			 * @param {jquery} li - The list item of this option
			 * @return {boolean} True if the scene doesn't have a journal entry defined
			 */
			condition: li => {
				const scene = game.scenes.get(li.data("documentId"));
				return !scene.journal;
			},
			/**
			 * Creates a new Journal Entry for the scene,
			 * with the same name as the scene. Then sets
			 * the new note as the scene notes for that scene.
			 *
			 * @param {jquery} li - The list item of this option
			 */
			callback: li => {
				const scene = game.scenes.get(li.data("documentId"));
				JournalEntry.create({
					name: scene.name,
					type: "base",
					types: "base"
				}, { renderSheet: true })
				.then(entry => scene.update({ "journal": entry.id }));
			}
		});
	}

	/**
	 * Returns a promise that resolves on the next animation frame.
	 *
	 * @static
	 * @return {Promise} A promise that resolves on the next animation frame
	 * @memberof PointOfInterestTeleporter
	 */
	static nextFrame() {
		return new Promise(resolve => window.requestAnimationFrame(resolve));
	}

	/**
	 * Waits for the existence of a property on an object, or some limited number of loops.
	 *
	 * @static
	 * @param {object} object
	 * @param {string} property
	 * @param {number} limit
	 * @memberof PointOfInterestTeleporter
	 * @return {Promise<boolean>} A promise that resolves when the property exists, or the limit is reached
	 */
	static async waitFor(object, property, limit) {
		for (; limit > 0 && !object[property]; limit--) await this.nextFrame();
		console.log(object, object[property]);
		return Boolean(object[property]);
	}

	/**
	 * Checks if the supplied note is associated with a scene,
	 * if so creates a new PointOfInterestTeleporter for that note.
	 *
	 * @static
	 * @param {Note} note - A map note to check 
	 * @memberof PointOfInterestTeleporter
	 */
	static async checkNote(note) {
		let scene;

		if(note?.document?.pageId != null){
			scene = game.scenes.find(s => (s.journalEntryPage != null && s.journalEntryPage == note?.document?.pageId));
		}else{
			scene = game.scenes.find(s => (s.journalEntryPage == null && s.journal?.id == note?.entry?.id));
		}

		if (!scene) return;
		if (!await this.waitFor(note, "mouseInteractionManager", 60)) return;
		
		new PointOfInterestTeleporter(note, scene); 
	}

	/**
	 * Creates an instance of PointOfInterestTeleporter.
	 * 
	 * @param {Note} note - A map note
	 * @param {Scene} scene - A target scene
	 * @memberof PointOfInterestTeleporter
	 */
	constructor(note, scene) {
		this.note = note;
		this.scene = scene;

		this.activateListeners();
	}
	/**
	 * Activate any event handlers
	 *
	 * @memberof PointOfInterestTeleporter
	 */
	activateListeners() {
		console.log(this.note);
		this.note.mouseInteractionManager.target.on("rightdown", this._contextMenu.bind(this));
	}
	/**
	 * Handle the right click event
	 *
	 * Binds this note to the context menu HUD
	 * and prevents the event from bubbling
	 *
	 * @param {Event} event - The event that triggered this callback
	 * @memberof PointOfInterestTeleporter
	 */
	_contextMenu(event) {
		console.log(event);
		event.stopPropagation();
		canvas.hud.poiTp.bind(this);
	}

	/**
	 * Convenience alias for the note x coordniate
	 *
	 * @readonly
	 * @memberof PointOfInterestTeleporter
	 */
	get x() { return this.note.x; }
	/**
	* Convenience alias for the note y coordniate
	*
	* @readonly
	* @memberof PointOfInterestTeleporter
	*/
	get y() { return this.note.y; }

	/**
	 * @typedef ContextMenuOption
	 * @property {string} icon - A string of HTML representing a Font Awesome icon
	 * @property {string} title - The text, or i18n reference, for the text to display on the option
	 * @property {string} trigger - The name of a method of PointOfInterestTeleporter to call in response to clicking this option
	 *//**
	 * Returns an array of menu option for the context menu.
	 *
	 * @return {ContextMenuOption[]} 
	 * @memberof PointOfInterestTeleporter
	 */
	getOptions() {
		const options = [
			{
				icon: `<i class="fas fa-eye fa-fw"></i>`,
				title: "poitp.view",
				trigger: "viewScene"
			}
		];
		const gmOptions = game.user.isGM ? [
			{
				icon: `<i class="fas fa-bullseye fa-fw"></i>`,
				title: "poitp.activate",
				trigger: "activateScene"
			},
			{
				icon: `<i class="fas fa-scroll fa-fw"></i>`,
				title: "poitp.toggleNav",
				trigger: "toggleNav"
			}
		] : [];

		return options.concat(gmOptions);
	}
	
	/**
	 * Activates the scene.
	 *
	 * @memberof PointOfInterestTeleporter
	 */
	activateScene() {
		this.scene.activate();
	}
	/**
	 * Shows the scene, but doens't activate it.
	 *
	 * @memberof PointOfInterestTeleporter
	 */
	viewScene() {
		this.scene.view();
	}
	/**
	 * Toggles whether or not the scene is shown in the navigation bar.
	 *
	 * @memberof PointOfInterestTeleporter
	 */
	toggleNav() {
		this.scene.update({ navigation: !this.scene.navigation });
	}
}

/**
 * The HUD used as a context menu for map notes.
 *
 * @class PoiTpHUD
 * @extends {BasePlaceableHUD}
 */
class PoiTpHUD extends BasePlaceableHUD {
	/**
	 * Assign the default options which are supported by the entity edit sheet
	 * @type {Object}
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "poi-tp-ctx-menu",
			template: "modules/poi-teleport/poi-hud.html"
		});
	}
	/**
	 * Binds an entity to the HUD
	 *
	 * The PointOfInterestTeleporter is stored,
	 * and the note associated with it is bound.
	 *
	 * @override
	 * @param {PointOfInterestTeleporter} poitp
	 * @memberof PoiTpHUD
	 */
	bind(poitp) {
		this.poitp = poitp;
		super.bind(poitp.note);
	}
	/**
	 * @typedef PoiTpHudData - Data to be sent to the POI TP HUD template
	 * @property {ContextMenuOption[]} options - The set of options
	 *//**
	 * Creates a data object to be passed to this HUD's Handlesbars template
	 *
	 * @override
	 * @return {PoiTpHudData}
	 * @memberof PoiTpHUD - Data to be sent to the POI TP HUD template
	 */
	getData() {
		/** @type PoiTpHudData */
		const data = {};

		data.options = this.poitp.getOptions();

		return data;
	}
	/**
	 * Activate any event listenders on the HUD
	 * 
	 * Activates a click listener to prevent propagation,
	 * as activates click listeners for all menu options.
	 *
	 * Each option has its own handler, stored in its data-trigger.
	 *
	 * @override
	 * @param {jquery} html - The html of the HUD
	 * @memberof PoiTpHUD
	 */
	activateListeners(html) {
		super.activateListeners(html);
		html.click(e => e.stopPropagation());
		html.find("[data-trigger]")
			.click((event) => this.poitp[event.currentTarget.dataset.trigger](event));
	}
	
	/**
	 * Set's the position of the HUD to match the position of the map note.
	 *
	 * @override
	 * @memberof PoiTpHUD
	 */
	setPosition() {
		const position = {
			left: this.object.x,
			top: this.object.y
		};
		this.element.css(position);
	}
}

Hooks.on("getSceneDirectoryEntryContext", (...args) => PointOfInterestTeleporter.getSceneDirEnCtx(...args));
Hooks.on("renderHeadsUpDisplay", (...args) => PointOfInterestTeleporter.renderHeadsUpDisplay(...args));
Hooks.on("canvasReady", () => PointOfInterestTeleporter.onReady());
Hooks.on("createNote", (...args) => PointOfInterestTeleporter.createNote(...args));
Hooks.on("updateNote", (...args) => PointOfInterestTeleporter.updateNote(...args));