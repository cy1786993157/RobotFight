using System;
using UnityEngine;
using MvR.Types;

namespace MvR
{
	/// <summary>
	/// This script displays a simple menu that can be customized.
	/// You can set any number of items in the menu, and define which function they run in which object.
	/// You can also pass an extra String value to go with the function call. The GUI elements in this script
	/// are very primitive and are not recommended for your full project. Instead you should consider using a
	/// more robust and advanced GUI system than what is available natively in Unity (21/8/2013)
	/// such as EZGUI or NGUI.
	/// </summary>
	public class GameMenu : MonoBehaviour
	{
		// List of custom menu items and their actions.
		public GameMenuItems[] gameMenuItems;
		public GUISkin guiSkin;

		// Index for general use.
		private int index;

		/// <summary>
		/// OnGUI is called for rendering and handling GUI events.
		/// This means that your OnGUI implementation might be called several times per frame (one call per event).
		/// For more information on GUI events see the Event reference. If the MonoBehaviour's enabled property is
		/// set to false, OnGUI() will not be called.
		/// </summary>
		public void OnGUI()
		{
			GUI.skin = guiSkin;

			// Go through all the menu items and create a button for each
			for( index = 0; index < gameMenuItems.Length; index++ )
			{
				//If we click on a button, run the corresponding function in the correct object		
				if( GUI.Button(new Rect((Screen.width - gameMenuItems[index].caption.Length * 20) * 0.5f, Screen.height * 0.5f + 52 * index, gameMenuItems[index].caption.Length * 20, 50), gameMenuItems[index].caption) )
				{
                    //if( audio )
                    //    audio.Play();
			
					gameMenuItems[index].reciever.gameObject.SendMessage(gameMenuItems[index].action, gameMenuItems[index].parameter);
				}
			}
		}

		/// <summary>
		/// Loads a URL.
		/// </summary>
		/// <param name='urlAddress'>
		/// URL address.
		/// </param>
		public void LoadURL(string urlAddress)
		{
			if( !string.IsNullOrEmpty(urlAddress) )
			{
				Application.OpenURL(urlAddress);
		
				this.enabled = false;
			}
		}

		/// <summary>
		/// Loads a level by name.
		/// </summary>
		/// <param name='levelName'>
		/// Level name.
		/// </param>
		public void LoadLevel(string levelName)
		{
			if( !string.IsNullOrEmpty(levelName) )
			{
				Application.LoadLevel(levelName);
		
				this.enabled = false;
			}
		}
	}
}
