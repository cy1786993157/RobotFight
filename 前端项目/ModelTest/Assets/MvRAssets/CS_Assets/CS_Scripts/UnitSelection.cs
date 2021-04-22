using UnityEngine;
using UnityEngine.UI;
using MvR.Types;

namespace MvR
{
	/// <summary>
	/// This script lists all the units avaialable in the game, and allows the player to choose which ones to take into battle. You can set the maximum number of
	/// allowed units in the battle, and wether a unit is essential to this battle. This script should be attached to the BuildController object along with other
	/// relevant scripts such as BuildController, EnemyDispenser, GameSpeed, etc.
	/// </summary>
	public class UnitSelection : MonoBehaviour
	{
		// Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
		public bool useOldUI = false;
		
		// The canvas for the unit selection menu in the new UI (4.6+)
		public Transform unitSelectionCanvas;

		//Maximum allowed units
		public int maxUnits = 5;

		// How many units are selected
		private int selectedUnits = 0;

		// This variable set a unit object and wether its essential in the current level
		public AllUnits[] allUnits;

		// An array of the buttons of the units we can build
		public Transform[] buildListButtons;
		
		// An array of buttons of all the units in the grid
		public Transform[] gridButtons;
		
		// An array of the units that can be deployed in this battle
		internal Transform[] buildList;

		public GUISkin guiSkin;
		
		// A grid of UI tiles for the units
		public Vector2 grid = new Vector2(4, 2);
		
		// The overall position and size of the grid
		public Rect positionAndSize = new Rect();
		
		// The size of each tile is calculated automaticall in Start()
		private Vector2 tileSize = new Vector2();
		
		// General use index variables
		private int indexA = 0;
		private int indexB = 0;
		private int indexC = 0;
		
		// The size of a button in the build list
		public Vector2 buttonSize = new Vector2(70, 70);

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			GameSpeed gs = GetComponent<GameSpeed>();
			BuildController bc = GetComponent<BuildController>();
			EnemyDispenser ed = GetComponent<EnemyDispenser>();
			GameMenu gm = GetComponent<GameMenu>();

			// Go through all the resource types the player has and deactivate their new UI (4.6+) icons
			for ( int resourceIndex = 0 ; resourceIndex < bc.moneyTypes.Length ; resourceIndex++ )
			{
				// Disable the icon of the resource type
				if ( bc.moneyTypes[resourceIndex].icon )
					bc.moneyTypes[resourceIndex].icon.gameObject.SetActive(false);
			}
			
			// If we are using the old GUI, deactivate the new UI canvas
			if ( useOldUI == true && unitSelectionCanvas )
				unitSelectionCanvas.gameObject.SetActive(false);

			// Deactivate the speed menu canvas, because we need to select units for the battle first
			if ( gs.speedMenuCanvas )
				gs.speedMenuCanvas.gameObject.SetActive(false);
			
			// Deactivate the build menu canvas, because we need to select units for the battle first
			if ( bc.buildMenuCanvas )
				bc.buildMenuCanvas.gameObject.SetActive(false);
			
			// Deactivate the enemy canvas, because we need to select units for the battle first
			if ( ed.enemyCanvas )
				ed.enemyCanvas.gameObject.SetActive(false);
			
			// If we are using the old UI, limit the value of Max Units based on the number of slots in the build list ( new UI )
			if ( useOldUI == false )    
			{
				if ( maxUnits > buildListButtons.Length  )
					maxUnits = buildListButtons.Length;
				
				// Remove any extra slots in the build list
				for ( int index = maxUnits ; index < buildListButtons.Length ; index++ )
				{
					// Make the button of the building in the build list unclickable
					//buildListButtons[index].GetComponent(Button).interactable = false;
					
					// Disable the whole building slot
					//buildListButtons[index].Find("Icon").gameObject.SetActive(false);
					
					//Disable the whole building slot
					buildListButtons[index].gameObject.SetActive(false);
				}
			}

			// Pause the game
			Time.timeScale = 0;

			// Calculate the size of a single tile within the grid of units
			tileSize = new Vector2(positionAndSize.width / grid.x, positionAndSize.height / grid.y);
	
			// Disable all other components in this game controller object
			if( bc )
				bc.enabled = false;

			if( ed )
				ed.enabled = false;

			if( gs )
				gs.enabled = false;

			if( gm )
				gm.enabled = false;
	
			// Set the build list in the BuildController script to be the same length as maxUnits
			bc.buildList = new Transform[maxUnits];
	
			// Register the build list transform array for easier access
			buildList = bc.buildList;

			// Set the units which are essential to this battle
			SetEssential();

			// Set the icons of the units in the grid
			SetGrid();
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
				// Build a list of buttons for the units selected for battle
				for ( indexA = 0 ;  indexA < buildList.Length ; indexA++ )
				{
					if ( indexA < maxUnits )
					{
						if ( !buildList[indexA] )
						{
							// If there is no unit at this tile, keep it empty
							GUI.Box( new Rect( indexA * buttonSize.x, 0, buttonSize.x, buttonSize.y), string.Empty);
						}
						else if ( GUI.Button(new Rect( indexA * buttonSize.x, 0, buttonSize.x, buttonSize.y), buildList[indexA].GetComponent<Building>().icon) )
						{
							AllUnits unit = allUnits[buildList[indexA].GetComponent<Building>().listIndex];

							// If there is a unit on this tile, and it's not essential, remove it from the list of units to be used in this battle
							if ( unit.essential == false )
							{
                                if (GetComponent<AudioSource>())
                                    GetComponent<AudioSource>().Play();
								
								// Assign the unit from the unit battle list back to the unit selection grid
								unit.unit = buildList[indexA];
								
								// Clear the unit from the unit battle list
								buildList[indexA] = null;
								
								selectedUnits--;
							}
						}
					}
				}
				
				GUI.Label( new Rect( (Screen.width - 400) * 0.5f, positionAndSize.y - 30, 400, 50), Application.loadedLevelName + " - SELECT YOUR UNITS");
				
				// Build a grid of buttons for the selectable units
				for ( indexA = 0 ; indexA < grid.y ; indexA++ )
				{
					for ( indexB = 0 ; indexB < grid.x ; indexB++ )
					{
						if ( indexC < allUnits.Length )
						{
							if ( allUnits[indexC].unit )
							{
								// If there is a unit on this tile, add it to the list of units to be used in this battle
								if ( GUI.Button( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), allUnits[indexC].unit.GetComponent<Building>().icon) )
								{
									// Go through the tiles in the unit list, and add the selected unit to the next empty slot
									for ( int unitIndex = 0; unitIndex < buildList.Length ; unitIndex++ )
									{
										if ( buildList[unitIndex] == null && allUnits[indexC].unit )
										{
											if ( GetComponent<AudioSource>() )
                                                GetComponent<AudioSource>().Play();
											
											AddUnit(indexC);
										}
									}	
								}
							}
							else
							{
								// If there is no unit in this slot, keep it empty
								GUI.Box( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), string.Empty);
							}
						}
						else
						{
							// If there is no unit in this slot, keep it empty
							GUI.Box( new Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), string.Empty);
						}
						
						indexC++;
					}
				}
				
				indexC = 0;
				
				//A "ready to begin" button
				if ( GUI.Button( new Rect( (Screen.width - 300) * 0.5f, positionAndSize.y + indexA * tileSize.y, 300, 50), "Ready To Begin!") )
				{
					StartGame();
				}
				
				//This button returns to the main menu
				if ( GUI.Button( new Rect( (Screen.width - 300) * 0.5f, Screen.height - 60, 300, 50), "Back To Menu") )
				{
                    if (GetComponent<AudioSource>())
                        GetComponent<AudioSource>().Play();
					
					Application.LoadLevel("StartMenu");
				}
			}
		}

		/// <summary>
		/// This function sets the essential units, which are automatically added to the unit battle list,
		/// and cannot be removed from it.
		/// </summary>
		public void SetEssential()
		{
			for( indexA = 0; indexA < grid.y; indexA++ )
			{
				for( indexB = 0; indexB < grid.x; indexB++ )
				{
					if( indexC < allUnits.Length )
					{
						if( allUnits[indexC].unit )
						{
							if( allUnits[indexC].essential == true )
							{
								// Go through the tiles in the unit list, and add the selected unit to the next empty slot
								for ( int unitIndex = 0; unitIndex < buildList.Length ; unitIndex++ )
								{
									if ( buildList[unitIndex] == null && allUnits[indexC].unit )
									{
										AddUnit(indexC);
									}
								}	
							}
						}
					}
			
					indexC++;
				}
			}
	
			indexC = 0;

			if ( useOldUI == false )
			{
				// Go through the buildlist and make all buttons unclickable
				for ( indexA = 0 ; indexA < buildList.Length ; indexA++ )
				{
					// Make the button of the building in the build list unclickable
					buildListButtons[indexA].GetComponent<Button>().interactable = false;
					
					// If the button has no building in it, disable the icon of the building in the build list
					if ( buildList[indexA] == null )
						buildListButtons[indexA].Find("Icon").GetComponent<Image>().enabled = false;
				}
			}
		}

		/// <summary>
		/// Adds a unit to the next available slot in the build list for the current match.
		/// </summary>
		/// <param name="gridIndex">Grid index.</param>
		public void AddUnit( int gridIndex )
		{
			// Find the next empty slot in the build list, and add this unit from the grid to it
			for ( int buildingIndex = 0 ; buildingIndex < buildList.Length ; buildingIndex++ )
			{
				if ( buildList[buildingIndex] == null && allUnits[gridIndex].unit )
				{
					// Set this unit as the selected
					buildList[buildingIndex] = allUnits[gridIndex].unit;
					
					// Record the index of this unit in the Building script
					buildList[buildingIndex].GetComponent<Building>().listIndex = gridIndex;
					
					if ( useOldUI == false )
					{
						// Make the button of the building in the build list clickable
						buildListButtons[buildingIndex].GetComponent<Button>().interactable = true;
						
						// Enable the icon of the building
						buildListButtons[buildingIndex].Find("Icon").GetComponent<Image>().enabled = true;
						
						// Add the icon of the building
						buildListButtons[buildingIndex].Find("Icon").GetComponent<Image>().sprite = Sprite.Create(allUnits[gridIndex].unit.GetComponent<Building>().icon , new Rect( 0, 0,allUnits[gridIndex].unit.GetComponent<Building>().icon.width, allUnits[gridIndex].unit.GetComponent<Building>().icon.height), new Vector2(0.5f, 0.5f));
						
						// Make the button of the building in the grid unclickable
						gridButtons[gridIndex].GetComponent<Button>().interactable = false;
						
						// Disable the icon of the building
						gridButtons[gridIndex].Find("Icon").GetComponent<Image>().enabled = false;
					}
					
					// Clear the unit
					allUnits[gridIndex].unit = null;
					
					// Increase the number of selected units
					selectedUnits++;
					
					return;
				}
			}
		}
		
		/// <summary>
		/// Adds a unit to the next available slot in the build list for the current match.
		/// </summary>
		/// <param name="unitIndex">Unit index.</param>
		public void RemoveUnit( int unitIndex )
		{
			// If there is a unit on this tile, and it's not essential, remove it from the list of units to be used in this battle
			if (  buildList[unitIndex] )
			{
				if ( allUnits[buildList[unitIndex].GetComponent<Building>().listIndex].essential == false )
				{
                    if (GetComponent<AudioSource>())
                        GetComponent<AudioSource>().Play();
					
					// Assign the unit from the unit battle list back to the unit selection grid
					allUnits[buildList[unitIndex].GetComponent<Building>().listIndex].unit = buildList[unitIndex];
					
					// Make the button of the building in the build list unclickable
					buildListButtons[unitIndex].GetComponent<Button>().interactable = false;
					
					// Disable the icon of the building in the build list
					buildListButtons[unitIndex].Find("Icon").GetComponent<Image>().enabled = false;
					
					// Make the button of the building in the grid clickable
					gridButtons[buildList[unitIndex].GetComponent<Building>().listIndex].GetComponent<Button>().interactable = true;
					
					// Enable the icon of the building in the grid
					gridButtons[buildList[unitIndex].GetComponent<Building>().listIndex].Find("Icon").GetComponent<Image>().enabled = true;
					
					// Clear the unit from the unit battle list
					buildList[unitIndex] = null;
					
					// Decrease the number of selected units
					selectedUnits--;
				}
			}
		}

		/// <summary>
		/// Sets the grid.
		/// </summary>
		public void SetGrid()
		{
			// Build a list of buttons for the units selected for battle
			for ( indexA = 0 ;  indexA < gridButtons.Length ; indexA++ )
			{
				// If there is a unit on this tile, and it's not essential, place it in the grid and not in the list of units to be used in battle
				if ( indexA < allUnits.Length && allUnits[indexA].essential == false )
				{
					// Enable the icon of the building
					gridButtons[indexA].Find("Icon").GetComponent<Image>().enabled = true;
					
					// Add the icon of the building
					gridButtons[indexA].Find("Icon").GetComponent<Image>().sprite = Sprite.Create(allUnits[indexA].unit.GetComponent<Building>().icon, new Rect( 0, 0,allUnits[indexA].unit.GetComponent<Building>().icon.width, allUnits[indexA].unit.GetComponent<Building>().icon.height), new Vector2(0.5f, 0.5f));
				}
				else
				{
					// Make the button of the building in the build list unclickable
					gridButtons[indexA].GetComponent<Button>().interactable = false;
					
					// Disable the icon of the building
					gridButtons[indexA].Find("Icon").GetComponent<Image>().enabled = false;
				}
			}
		}
		
		/// <summary>
		/// Ends the unit selection phase, and starts the game.
		/// </summary>
		public void StartGame()
		{
			// If we have at least one selected unit, start the game
			if ( selectedUnits > 0 )
			{
				GameSpeed gs = GetComponent<GameSpeed>();
				BuildController bc = GetComponent<BuildController>();
				EnemyDispenser ed = GetComponent<EnemyDispenser>();

				// Unpause the game
				Time.timeScale  = 1;

                if (GetComponent<AudioSource>())
                    GetComponent<AudioSource>().Play();
				
				// Enable all other components in this game controller object
				if ( bc ) 
					bc.enabled = true;

				if ( ed )  
					ed.enabled = true;

				if ( gs )  
					gs.enabled = true;
				
				// Assign the correct cooldown for each unit in the list
				bc.GetCooldowns();
				
				// Deactivate the unit selection canvas
				if ( unitSelectionCanvas ) 
					unitSelectionCanvas.gameObject.SetActive(false);
				
				// If we are using the new GUI (4.6+), activate the build menu canvas and set the build list for it
				if ( useOldUI == false )
				{
					// If we have a speed menu canvas assigned, activate it
					if ( gs.speedMenuCanvas )
						gs.speedMenuCanvas.gameObject.SetActive(true);
					
					// If we have a build menu canvas assigned, activate it
					if ( bc.buildMenuCanvas ) 
						bc.buildMenuCanvas.gameObject.SetActive(true);
					
					// If we have an enemy canvas assigned, activate it
					if ( ed.enemyCanvas )
						ed.enemyCanvas.gameObject.SetActive(true);
					
					// Set the build list icons in the build controller
					bc.SetBuildList();
					
					// If we have a game speed canvas assigned, activate it
					if ( gs ) 
					{
						if ( gs.speedMenuCanvas ) 
							gs.speedMenuCanvas.gameObject.SetActive(true);
					}
					
					// Go through all the resource types the player has and activate their new UI (4.6+) icons
					for ( int resourceIndex = 0 ; resourceIndex < bc.moneyTypes.Length ; resourceIndex++ )
					{
						// Activate the icon of the resource type
						bc.moneyTypes[resourceIndex].icon.gameObject.SetActive(true);
					}
				}
				
				// Disable this script
				this.enabled = false;
			}
		}
	}
}
