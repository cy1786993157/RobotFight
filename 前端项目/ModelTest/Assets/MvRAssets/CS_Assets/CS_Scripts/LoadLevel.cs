using UnityEngine;

namespace MvR
{
	public class LoadLevel : MonoBehaviour
	{
		public string levelName = "CSStressTest"; // Level name to load.

		/// <summary>
		/// Activate this instance.
		/// </summary>
		public void Activate()
		{
			Application.LoadLevel(levelName);
		}
	}
}
