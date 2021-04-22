using UnityEngine;
using UnityEngine.UI;
using System.Collections;

namespace MvR
{
	/// <summary>
	/// This script allows you to set several speeds for the game, and scroll through them with buttons.
	/// </summary>
	public class GameSpeed : MonoBehaviour
	{
		// Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
		public bool useOldUI = false;
		
		// The canvas for the game elements in the new UI (4.6+)
		public Transform buildMenuCanvas;
		public Transform gameMenuCanvas;
		public Transform speedMenuCanvas;

		// Global game speed
		public float[] gameSpeeds;
		private int currentSpeed = 0;
		internal bool isPaused = false;
		public GUISkin guiSkin;
		public Vector2 offset;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Deactivate the new UI menu elements at the start of the game
			if ( gameMenuCanvas )    
				gameMenuCanvas.gameObject.SetActive(false);

			Time.timeScale = gameSpeeds[currentSpeed];
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
			
			if ( useOldUI == true )
			{
				if ( gameSpeeds.Length > 0 )
				{
					// Create a label for the game's current speed. Note that setting the game to very high speeds will result in hit detection problems
					GUI.Box( new Rect(Screen.width * 0.5f + offset.x, Screen.height - 30 + offset.y, 40, 25), gameSpeeds[currentSpeed].ToString() + "X");
					
					// If we press the speed up button, increase the speed to the next tier
					if ( GUI.Button( new Rect(Screen.width * 0.5f + 40 + offset.x, Screen.height - 32 + offset.y, 40, 30), ">>") )
						NextSpeed();
					
					// If we press the speed down button, decrease the speed to the previous tier
					if ( GUI.Button( new Rect(Screen.width * 0.5f - 80 + offset.x, Screen.height - 32 + offset.y, 40, 30), "<<") )
						PreviousSpeed();
				}
				
				// If we press the pause button, stop the game and display a menu
				if ( GUI.Button( new Rect(Screen.width * 0.5f + offset.x - 40, Screen.height - 32 + offset.y, 40, 30), "ll") )
					Pause();
			}
		}

		/// <summary>
		/// Pauses gameplay, and deactivates in-game menu items.
		/// </summary>
		public void Pause()
		{
			isPaused = true;
	    	
			Time.timeScale = 0;
	
			BuildController bc = GetComponent<BuildController>();
			EnemyDispenser ed = GetComponent<EnemyDispenser>();
			GameSpeed gs = GetComponent<GameSpeed>();
			GameMenu gm = GetComponent<GameMenu>();

			// Enable all other components in this game controller object
			if( bc )
				bc.enabled = false;

			if( ed )
				ed.enabled = false;

			if( gs )
				gs.enabled = false;

			// If we are using the old UI, activate the OnGUI game menu
			if ( gm && useOldUI == true )
				gm.enabled = true;
			
			// If we have a game menu canvas for the new UI (4.6+), activate it
			if ( useOldUI == false )
			{
				if ( gameMenuCanvas )
					gameMenuCanvas.gameObject.SetActive(true);

				if ( speedMenuCanvas )
					speedMenuCanvas.gameObject.SetActive(false);

				if ( buildMenuCanvas )
					buildMenuCanvas.gameObject.SetActive(false);
			}
		}

		/// <summary>
		/// Resumes gameplay, and reactivates in-game menu items.
		/// </summary>
		public void Resume()
		{
			isPaused = false;
	
			if( gameSpeeds.Length > 0 )
			{
				Time.timeScale = gameSpeeds[currentSpeed];
			}
			else
			{
				Time.timeScale = 1;
			}
	
			BuildController bc = GetComponent<BuildController>();
			EnemyDispenser ed = GetComponent<EnemyDispenser>();
			GameSpeed gs = GetComponent<GameSpeed>();
			GameMenu gm = GetComponent<GameMenu>();

			// Enable all other components in this game controller object
			if( bc )
				bc.enabled = true;

			if( ed )
				ed.enabled = true;

			if( gs )
				gs.enabled = true;

			// Disable the in-game menu
			if( gm )
				gm.enabled = false;

			// If we have a game menu canvas for the new UI (4.6+), deactivate it
			if ( useOldUI == false )
			{
				if ( gameMenuCanvas )
					gameMenuCanvas.gameObject.SetActive(false);

				if ( speedMenuCanvas )
					speedMenuCanvas.gameObject.SetActive(true);

				if ( buildMenuCanvas )
					buildMenuCanvas.gameObject.SetActive(true);
			}
		}

		/// <summary>
		/// Changes the speed to the next speed level
		/// </summary>
		public void NextSpeed()
		{
			if ( currentSpeed < gameSpeeds.Length - 1 )
			{
				currentSpeed++;
				
				Time.timeScale = gameSpeeds[currentSpeed];
				
				if ( speedMenuCanvas )
					speedMenuCanvas.Find("MenuButtons/GameSpeed/Text").GetComponent<Text>().text = gameSpeeds[currentSpeed].ToString() + "X";
			}
		}
		
		/// <summary>
		/// Changes the speed to the previous speed level
		/// </summary>
		public void PreviousSpeed()
		{
			if ( currentSpeed > 0 )
			{
				currentSpeed--;
				
				Time.timeScale = gameSpeeds[currentSpeed];
				
				if ( speedMenuCanvas )
					speedMenuCanvas.Find("MenuButtons/GameSpeed/Text").GetComponent<Text>().text = gameSpeeds[currentSpeed].ToString() + "X";
			}
		}
	}
}
