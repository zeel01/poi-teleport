/** 
 * Point of Interest Teleporter
 */


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
	 * @param {*} note - A map note
	 * @param {*} scene - A target scene
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
	_contextMenu() {
		this.scene.activate();
	}
}

Hooks.on("canvasReady", () => PointOfInterestTeleporter.onReady());