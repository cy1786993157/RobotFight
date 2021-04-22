using UnityEngine;
using UnityEngine.UI;

namespace MvR
{
	/// <summary>
	/// This script displays a grid of levels, some of which are locked. You can select a level to play.
	/// In the EnemyDispenser script, if you win a level, another level is unlocked from the list of levels.
	/// </summary>
	public class LevelSelection : MonoBehaviour
	{
		// Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
		public bool useOldUI = false;

		/// The level name format that will be used throught the game. ex: levelNamePrefix will be the prefix of all 
		/// the levels in the game, so the levels will be named "LEVEL1", "LEVEL2", etc
		public string levelNamePrefix = "CSLEVEL";

		// A list of all available levels
		public int[] levelStatus;

		public Transform[] levelButtons;

		public GUISkin guiSkin;
		
		// The grid of tiles/buttons
		public Vector2 grid = new Vector2(4, 2);
		
		// The overall position and size of the tile grid
		public Rect positionAndSize = new Rect();
		
		// The size of a single tile
		private Vector2 tileSize = new Vector2();
		
		// The size of the star icon based on the ratio between the tile size and the maximum number of stars
		private Vector2 starSize = new Vector2();
		
		// General use index variables
		private int indexLevel = 0;
		private int indexA = 0;
		private int indexB = 0;
		private int indexC = 0;
		
		// The graphic of the lock on a level tile
		public Texture2D lockIcon;
		
		// The maximum possible star rating for a level
		public float maxStarRatings = 6;
		
		// The image to display for a star and empty star rating
		public Texture2D starIcon;
		public Texture2D starEmptyIcon;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// The size of a tile (button)
			tileSize = new Vector2(positionAndSize.width / grid.x, positionAndSize.height / grid.y);

			// Calculate the size of the star icon based on the ratio between the tile size and the maximum number of stars
			starSize = new Vector2(tileSize.x / maxStarRatings, tileSize.y / maxStarRatings);

			// Set the level lock/unlock status
			SetLevelStatus();
		}

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// If the level status is 0, then it's locked
			for ( indexLevel = 0 ; indexLevel < levelButtons.Length ; indexLevel++ )
			{
				if ( levelStatus[indexLevel] == 0 )
				{
					levelButtons[indexLevel].Find("StarsEmpty").gameObject.SetActive(false);			
					levelButtons[indexLevel].Find("StarsFull").gameObject.SetActive(false);
					levelButtons[indexLevel].Find("LockIcon").gameObject.SetActive(true);
					
					levelButtons[indexLevel].GetComponent<Button>().interactable = false;
				}
				else
				{
					levelButtons[indexLevel].Find("StarsEmpty").gameObject.SetActive(true);			
					levelButtons[indexLevel].Find("StarsFull").gameObject.SetActive(true);
					levelButtons[indexLevel].Find("LockIcon").gameObject.SetActive(false);
					
					levelButtons[indexLevel].GetComponent<Button>().interactable = true;

					Vector2 deltaSize = new Vector2(levelButtons[indexLevel].Find("StarsEmpty").GetComponent<RectTransform>().sizeDelta.x * ((levelStatus[indexLevel] - 1)/maxStarRatings), levelButtons[indexLevel].Find("StarsFull").GetComponent<RectTransform>().sizeDelta.y);

					levelButtons[indexLevel].Find("StarsFull").GetComponent<RectTransform>().sizeDelta = deltaSize;
				}
			}
		}

		/// <summary>
		/// OnGUI is called for rendering and handling GUI events.
		/// This means that your OnGUI implementation might be called several times per frame (one call per event).
		/// For more information on GUI events see the Event reference. If the MonoBehaviour's enabled property is
		/// set to false, OnGUI() will not be called.
		/// </summary>
		public void OnGUI()
		{
			if ( useOldUI == true )
			{
				GUI.skin = guiSkin;
				
				GUI.Label( new Rect( (Screen.width - 200) * 0.5f, positionAndSize.y - 100, 400, 50), "SELECT A LEVEL");
				
				// Create the grid of buttons
				for ( indexA = 0 ; indexA < grid.y ; indexA++ )
				{
					for ( indexB = 0 ; indexB < grid.x ; indexB++ )
					{
						// If the level status is 0, then it's locked
						if ( indexLevel < levelStatus.Length )
						{
							if ( levelStatus[indexLevel] == 0 )
							{
								GUI.Label( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), lockIcon);
							}
						}
						
						// If the level status is higher than 0, then it's unlocked
						if ( indexLevel < levelStatus.Length )
						{
							// Display a button with the level name, clicking it will take you to the corresponding level
							if ( GUI.Button( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), "Level" + (indexLevel + 1).ToString()) )
							{
								if ( levelStatus[indexLevel] > 0 )    
								{
                                    if (GetComponent<AudioSource>())
                                        GetComponent<AudioSource>().Play();
									
									Application.LoadLevel("Level" + (indexLevel + 1));
								}
							}
							
							// Display the star rating for each level
							for ( indexC = 0 ; indexC < maxStarRatings ; indexC++ )
							{
								if ( indexC < PlayerPrefs.GetInt(levelNamePrefix + (indexLevel + 1)) - 1 )
								{
									if ( starIcon )
									{
										GUI.Label( new Rect( positionAndSize.x + indexB * tileSize.x + starSize.x * (indexC + 0.2f), positionAndSize.y + (indexA + 1) * tileSize.y - starSize.y * 1.2f, starSize.x, starSize.y), starIcon);
									}
								}
								else if ( levelStatus[indexLevel] > 0 )
								{
									if ( starEmptyIcon )
									{
										GUI.Label( new Rect( positionAndSize.x + indexB * tileSize.x + starSize.x * (indexC + 0.2f), positionAndSize.y + (indexA + 1) * tileSize.y - starSize.y * 1.2f, starSize.x, starSize.y), starEmptyIcon);
									}
								}
							}
						}
						else
						{
							GUI.Box( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), string.Empty);
						}
						
						indexLevel++;
					}
				}
				
				indexLevel = 0;
				
				// A button to return to the main menu
				if ( GUI.Button( new Rect( (Screen.width - 300) * 0.5f, Screen.height - 60, 300, 50), "Back To Menu") )
				{
                    if (GetComponent<AudioSource>())
                        GetComponent<AudioSource>().Play();
					
					GetComponent<StartMenu>().enabled = true; 
					this.enabled = false;
				}
			}
		}

		/// <summary>
		/// Sets the level status for all levels, and saves them to PlayerPrefs.
		/// </summary>
		public void SetLevelStatus()
		{
			for( indexC = 0; indexC < levelStatus.Length; indexC++ )
			{
				// If there is no previous record of the level status, use the record in the game itself
				if( PlayerPrefs.HasKey(levelNamePrefix + (indexC + 1)) )
				{
					levelStatus[indexC] = PlayerPrefs.GetInt(levelNamePrefix + (indexC + 1));
				}
				else
				{
					PlayerPrefs.SetInt(levelNamePrefix + (indexC + 1), levelStatus[indexC]);
				}
			}
	
			PlayerPrefs.Save();
		}

		/// <summary>
		/// Clears the level statuses.
		/// </summary>
		public void ClearLevelStatus()
		{
			// Remove all level status records from the levels
			for( indexC = 0; indexC < levelStatus.Length; indexC++ )
			{
				PlayerPrefs.DeleteKey(levelNamePrefix + (indexC + 1));
			}
	
			PlayerPrefs.Save();
	
			// Restart the level to make PlayerPrefs take effect
			Application.LoadLevel(Application.loadedLevelName);
		}

		/// <summary>
		/// Unlocks the level status.
		/// </summary>
		public void UnlockLevelStatus()
		{
			// Set all levels status to "unlocked"
			for( indexC = 0; indexC < levelStatus.Length; indexC++ )
			{
				PlayerPrefs.SetInt(levelNamePrefix + (indexC + 1), 1);
			}
	
			PlayerPrefs.Save();
	
			// Restart the level to make PlayerPrefs take effect
			Application.LoadLevel(Application.loadedLevelName);
		}
	}
}
