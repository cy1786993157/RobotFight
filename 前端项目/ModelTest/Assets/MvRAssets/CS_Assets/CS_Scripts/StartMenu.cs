using UnityEngine;
using MvR.Types;
using UnityEngine.SceneManagement;

namespace MvR
{
	/// <summary>
	/// This script display a simple start menu with some basic options: "START GAME" which is obvious, "Reset stats" which resets the game's PlayerPref stats back
	/// to default, and "Unlock all levels" for developers who don't want to play through all levels. The GUI elements in this script are very primitive and are not
	/// recommended for your full project. Instead you should consider using a more robust and advanced GUI system than what is available natively in Unity (21/8/2013)
	/// such as EZGUI or NGUI.
	/// </summary>
	[RequireComponent (typeof(LevelSelection))]
	public class StartMenu : MonoBehaviour
	{
		// The title graphic.
		public Texture2D title;

		// General use index
		private int index;

		// List of custom menu items and their actions
		public MenuItems[] menuItems;
		public GUISkin guiSkin;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Disable the level selection component
			GetComponent<LevelSelection>().enabled = false;
		}

		/// <summary>
		/// OnGUI is called for rendering and handling GUI events.
		/// This means that your OnGUI implementation might be called several times per frame (one call per event).
		/// For more information on GUI events see the Event reference. If the MonoBehaviour's enabled property is
		/// set to false, OnGUI() will not be called.
		/// </summary>
		public void OnGUI()
		{
			GUI.skin = guiSkin;
	
			// Display the title graphic
			if( title )
				GUI.Label(new Rect((Screen.width - title.width) * 0.5f, 0, title.width, title.height), title);
	
			for( index = 0; index < menuItems.Length; index++ )
			{
				//This button enables the level selection object, which we can choose levels from
				if( GUI.Button(new Rect((Screen.width - menuItems[index].caption.Length * 20) * 0.5f, Screen.height * 0.5f + 52 * index, menuItems[index].caption.Length * 20, 50), menuItems[index].caption) )
				{
                    //if( audio )
                    //    audio.Play();

					menuItems[index].reciever.gameObject.SendMessage(menuItems[index].action);
				}
			}
		}

		/// <summary>
		/// Starts the game.
		/// </summary>
		public void StartGame()
		{
			// Disable the start menu component, while enabling the level selection component
			GetComponent<LevelSelection>().enabled = true;
			this.enabled = false;
		}

		/// <summary>
		/// Loads the level by string/name.
		/// </summary>
		/// <param name="levelName">Level name</param>
		public void LoadLevel( string levelName )
		{
			//Application.LoadLevel(levelName);
            SceneManager.LoadScene(levelName);
		}

		/// <summary>
		/// Opens the url in a browser.
		/// </summary>
		/// <param name="urlName">URL</param>
		public void LoadURL( string urlName )
		{
			Application.OpenURL(urlName);
		}
	}
}

