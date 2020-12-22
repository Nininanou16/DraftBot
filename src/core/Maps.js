class Maps {

	static Directions = {
		NORTH: "north",
		SOUTH: "south",
		EAST: "east",
		WEST: "west"
	};

	/**
	 * Returns the map ids a player can go to. It excludes the map the player is coming from if at least one map is available
	 * @param {Players} player
	 * @returns {Number[]}
	 */
	static async getNextPlayerAvailableMaps(player) {
		const map = await MapLocations.getById(player.map_id);
		let next_maps = [];
		if (map.north_map && map.north_map !== player.previous_map_id) {
			next_maps.push(map.north_map);
		}
		if (map.south_map && map.south_map !== player.previous_map_id) {
			next_maps.push(map.south_map);
		}
		if (map.east_map && map.east_map !== player.previous_map_id) {
			next_maps.push(map.east_map);
		}
		if (map.west_map && map.west_map !== player.previous_map_id) {
			next_maps.push(map.west_map);
		}
		if (map.length === 0 && player.previous_map_id) {
			map.push(player.previous_map_id);
		}
		return next_maps;
	}

	/**
	 * Returns the direction of a map to another. The result is null if the maps are not connected
	 * @param {MapLocations} from_map
	 * @param {Number} to_map_id
	 * @returns {Directions|null}
	 */
	static getMapDirection(from_map, to_map_id) {
		if (!from_map) {
			return null;
		}
		if (from_map.north_map === to_map_id) {
			return this.Directions.NORTH;
		}
		if (from_map.south_map === to_map_id) {
			return this.Directions.SOUTH;
		}
		if (from_map.east_map === to_map_id) {
			return this.Directions.EAST;
		}
		if (from_map.west_map === to_map_id) {
			return this.Directions.WEST;
		}
		return null;
	}

	/**
	 * Get the placeholder of the events. It is designed to be used in the format function
	 * @param {Players} player
	 * @param {"fr"|"en"} language
	 * @returns {{}}
	 */
	static async getEventPlaceHolders(player, language) {
		const previous_map = await MapLocations.getById(player.previous_map_id);
		const direction = this.getMapDirection(previous_map, player.map_id);
		return {
			direction: !direction ? "null" : JsonReader.models.maps.getTranslation(language).directions.names[direction],
			direction_prefix: !direction ? "null" : JsonReader.models.maps.getTranslation(language).directions.prefix[direction],
		}
	}

	/**
	 * Get is the player is currently travelling between 2 maps
	 * @param {Players} player
	 * @returns {boolean}
	 */
	static isTravelling(player) {
		return player.start_travel_date.getMilliseconds() !== 0;
	}

	/**
	 * Get the time in ms the player is travelling
	 * @param {Players} player
	 * @returns {number}
	 */
	static getTravellingTime(player) {
		if (!this.isTravelling(player)) return 0;
		return new Date() - player.start_travel_date;
	}

	/**
	 * Make a player start travelling. It does not check if the player currently travelling, if the maps are connected etc. It also saves the player
	 * @param {Players} player
	 * @param {number} map_id
	 * @returns {Promise<void>}
	 */
	static async startTravel(player, map_id) {
		player.previous_map_id = player.map_id;
		player.map_id = map_id;
		player.start_travel_date = new Date();
		await player.save();
	}

	/**
	 * Make a player stop travelling. It saves the player
	 * @param {Players} player
	 * @returns {Promise<void>}
	 */
	static async stopTravel(player) {
		player.start_travel_date = 0;
		await player.save();
	}
}

module.exports = Maps;