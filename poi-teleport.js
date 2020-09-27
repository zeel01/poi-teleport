/**
 * @class PointOfInterestTeleporter
 */
class PointOfInterestTeleporter {
	/**
	 * Handles on the canvasReady Hook.
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

	static renderHeadsUpDisplay(hud, html) {
		hud.poiTp = new PoiTpHUD();
		const hudTemp = document.createElement("template");
		hudTemp.id = "poi-tp-ctx-menu";
		html.append(hudTemp);
	}
	static createNote(scene, noteData) {
		const note = canvas.notes.placeables.find(n => n.id == noteData._id);
		if (!note) return;
		this.checkNote(note);
	}
	static getSceneDirEnCtx(html, options) {
		options.splice(2, 0, {
			name: "poitp.createNote",
			icon: '<i class="fas fa-scroll"></i>',
			condition: li => {
				const scene = game.scenes.get(li.data("entityId"));
				return !scene.journal;
			},
			callback: li => {
				const scene = game.scenes.get(li.data("entityId"));
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
	 * Checks if the supplied note is associated with a scene,
	 * if so creates a new PointOfInterestTeleporter for that note.
	 *
	 * @static
	 * @param {Note} note - A map note to check 
	 * @memberof PointOfInterestTeleporter
	 */
	static checkNote(note) {
		const scene = game.scenes.find(s => s.data?.journal == note?.entry?.id);
		if (scene) new PointOfInterestTeleporter(note, scene); 
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
		this.note.mouseInteractionManager.target.on("rightdown", this._contextMenu.bind(this));
	}
	/**
	 * Handle the right click event
	 *
	 * @memberof PointOfInterestTeleporter
	 */
	_contextMenu(event) {
		const pt = canvas.hud.poiTp;
		const states = Application.RENDER_STATES;

		event.stopPropagation();

		pt.bind(this);
		
	}
	get x() { return this.note.x; }
	get y() { return this.note.y; }

	getOptions() {
		return [
			{
				icon: `<i class="fas fa-bullseye fa-fw"></i>`,
				title: "poitp.activate",
				trigger: "activateScene"
			},
			{
				icon: `<i class="fas fa-eye fa-fw"></i>`,
				title: "poitp.view",
				trigger: "viewScene"
			},
			{
				icon: `<i class="fas fa-scroll fa-fw"></i>`,
				title: "poitp.toggleNav",
				trigger: "toggleNav"
			}
		]
	}

	activateScene() {
		this.scene.activate();
	}
	viewScene() {
		this.scene.view();
	}
	toggleNav() {
		this.scene.update({ navigation: !this.scene.data.navigation });
	}
}

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
	bind(poitp) {
		this.poitp = poitp;
		super.bind(poitp.note);
	}
	getData() {
		const data = {};

		data.options = this.poitp.getOptions();

		return data;
	}
	activateListeners(html) {
		super.activateListeners(html);
		html.click(e => e.stopPropagation());
		html.find("[data-trigger]")
			.click((event) => this.poitp[event.currentTarget.dataset.trigger](event));
	}
	setPosition(options = {}) {
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