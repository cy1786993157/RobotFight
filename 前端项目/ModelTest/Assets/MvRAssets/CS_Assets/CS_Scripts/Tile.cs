using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script simply holds info about a tile. A tile is the object which buildings can be placed upon.
	/// </summary>
	public class Tile : MonoBehaviour
	{
		// The building which is currently placed on this tile
		public Transform building;
		
		// The stackable which is currently placed on this tile
		public Transform stackable;
	}
}
