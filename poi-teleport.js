/** 
 * Point of Interest Teleporter
 */
//CONFIG.debug.hooks = true;

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

		console.log(game.i18n.localize("poitp.name"), "| Ready.");	
	}

	static renderHeadsUpDisplay(hud, html) {
		hud.poiTp = new PoiTpHUD();
		const hudTemp = document.createElement("template");
		hudTemp.id = "poi-tp-ctx-menu";
		html.append(hudTemp);

	//	$(document).on("click contextmenu", (event) => {
	//		hud.poiTp.clear();
	//	});
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
		const scene = game.scenes.find(s => s.data.journal == note.entry.id);
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
		event.stopPropagation();
		const ev = event.data.originalEvent;
		ev.stopPropagation();
		const pos = { x: ev.clientX, y: ev.clientY };

		canvas.hud.poiTp.bind(this);
		
		
	//	const ctxMenu = document.createElement("div");
	//	ctxMenu.classList.add("poi-tp-ctx-menu");
	//	ctxMenu.style.top = pos.y + "px";
	//	ctxMenu.style.left = pos.x + "px";

	//	document.querySelector("body").appendChild(ctxMenu);

		//this.scene.activate();
	}
	get x() { return this.note.x; }
	get y() { return this.note.y; }

	getOptions() {
		return [
			{
				icon: `<i class="fas fa-bullseye fa-fw"></i>`,
				title: "Activate",
				trigger: "activateScene"
			},
			{
				icon: `<i class="fas fa-eye fa-fw"></i>`,
				title: "View",
				trigger: "viewScene"
			},
			{
				icon: `<i class="fas fa-scroll fa-fw"></i>`,
				title: "Toggle Navigation",
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
			left: options.left || this.object.x,
			top: options.top || this.object.y
		};
		this.element.css(position);
	}
}

Hooks.on("renderHeadsUpDisplay", (...args) => PointOfInterestTeleporter.renderHeadsUpDisplay(...args))
Hooks.on("canvasReady", () => PointOfInterestTeleporter.onReady());