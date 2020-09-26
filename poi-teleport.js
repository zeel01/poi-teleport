/** 
 * Point of Interest Teleporter
 */
Added//CONFIG.debug.hooks = true;

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

		canvas.hud.poiTp.bind(this.note);
		
		
	//	const ctxMenu = document.createElement("div");
	//	ctxMenu.classList.add("poi-tp-ctx-menu");
	//	ctxMenu.style.top = pos.y + "px";
	//	ctxMenu.style.left = pos.x + "px";

	//	document.querySelector("body").appendChild(ctxMenu);

		//this.scene.activate();
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
	activateListeners(html) {
		super.activateListeners(html);
		html.click(e => e.stopPropagation());
	}
}

Hooks.on("renderHeadsUpDisplay", (...args) => PointOfInterestTeleporter.renderHeadsUpDisplay(...args))
Hooks.on("canvasReady", () => PointOfInterestTeleporter.onReady());