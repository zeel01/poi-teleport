/** 
 * Point of Interest Teleporter
 */

class PointOfInterestTeleporter {
	static onReady() {
		canvas.notes.placeables.forEach(n => this.checkNote(n));

		console.log(game.i18n.localize("poitp.name"), "| Ready.");	
	}
	static checkNote(note) {
		const scene = game.scenes.find(s => s.data.journal == note.entry.id);
		if (scene) new PointOfInterestTeleporter(note, scene); 
	}

	constructor(note, scene) {
		this.note = note;
		this.scene = scene;

		this.activateListeners();
		
	}
	activateListeners() {
		this.note.mouseInteractionManager.target.on("rightdown", this._contextMenu.bind(this));
	}
	_contextMenu() {
		this.scene.activate();
	}
}

Hooks.on("canvasReady", () => PointOfInterestTeleporter.onReady());