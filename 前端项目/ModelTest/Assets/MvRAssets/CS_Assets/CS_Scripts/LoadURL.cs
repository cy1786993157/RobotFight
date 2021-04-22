using UnityEngine;

namespace MvR
{
	/// <summary>
	/// Represents behavior for opening a browser to a specific URL.
	/// </summary>
	public class LoadURL : MonoBehaviour
	{
		public string URL = "https://www.assetstore.unity3d.com/#/publisher/4255";

		/// <summary>
		/// Opens specified URL in browser.
		/// </summary>
		public void Activate()
		{
			Application.OpenURL(URL);

			Application.ExternalEval("window.open('http://your site.com','Window title')");
		}
	}
}
