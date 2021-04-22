using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using MvR.Types;

namespace MvR
{
#pragma warning disable 0414

	/// <summary>
	/// This script includes the player's money and a list of buildings you can buy.
	/// It lists the buildings in a menu with their names and prices, and allows
	/// the player to click on one and place it on a valid tile.
	/// The price is reduced and the cooldown timer is set based on the building stats.
	/// </summary>
	//[ExecuteInEditMode]
	public class BuildController : MonoBehaviour
	{
		// Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
		public bool useOldUI = false;
		
		// The pointer that is used to place buildings when using a keyboard or a gamepad
		internal Transform pointer;
		internal Vector3 pointerPos;
		public float pointerSpeed = 10;

		//The area within which the pointer can move
		public Rect pointerMoveArea = new Rect(1.5f, -0.5f, 10.5f, 5.5f);

		// Is the mouse being used now? If not, then the keyboard/gamepad is used.
		internal bool mouseControls = true;
		
		// The canvas for the build menu in the new UI (4.6+)
		public Transform buildMenuCanvas;

		// Caching the transform for quicker access
		private Transform thisTransform;

		// A general use index
		private int index;

		// An array of all the resources the player can collect
		public MoneyType[] moneyTypes;

		// Player money
		public int money = 100;

		// An array of the buildings we can place
		public Transform[] buildList;

		// An array of the buttons of the units we can build
		public Transform[] buildListButtons;

		// The current selected building and its index
		internal Transform currentBuild;
		internal int currentIndex;
		
		// The cooldown for each building
		private float[] cooldown;
		private float[] cooldownCount;
		
		// Error check when we place the building on a tile
		internal bool error = false;
		public Texture2D errorIcon;
		
		// Sell button for selling buildings we already placed on a tile
		internal bool sell = false;
		public Texture2D sellIcon;
		public float sellValue = 1;
		
		// A general raycast for hit detection
		public RaycastHit hit;
		public AudioClip soundBuild;
		public AudioClip soundSell;
		public GUISkin guiSkin;
		
		// The size of a button in the build list
		public Vector2 buttonSize = new Vector2(70, 70);
		
		// The icon for the money label
		public Texture2D moneyIcon;
		private Rect moneyRect = new Rect(0, Screen.height - 64, 120, 64); // The money rect for displaying the current amount of money.

		// The size of the resource bars
		public Vector2 moneyIconSize = new Vector2(120,64);

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Create a new pointer transform, which can be controlled by either the mouse or the keyboard/gamepad
			GameObject tempGo = new GameObject();
			pointer = tempGo.transform;	
			pointer.name = "Pointer";
			pointer.position = new Vector3(-10, 5, 5);

			// If we are using the old GUI, deactivate the new UI canvas 
			if ( useOldUI == true )    
			{
				// Go through all the resource types the player has and deactivate their new UI (4.6+) icons
				for ( int resourceIndex = 0 ; resourceIndex < moneyTypes.Length; resourceIndex++ )
				{
					// Disable the icon of the resource type
					if ( moneyTypes[resourceIndex].icon )
						moneyTypes[resourceIndex].icon.gameObject.SetActive(false);
				}
			}
			else
			{
				if ( buildMenuCanvas ) 
					buildMenuCanvas.gameObject.SetActive(false);

				// If we are using the new UI (4.6+), set the build list for the buttons of the new UI
				ClearBuildList();

				UnitSelection unitSelection = GetComponent<UnitSelection>();

				// If we don't have a unit selection script, set the build list from this script
				if ( !unitSelection )
					SetBuildList(); 

				if ( unitSelection.enabled == false )
					SetBuildList(); 
			}
			
			thisTransform = transform; // Caching transform for quicker access

			GameMenu gameMenu = GetComponent<GameMenu>();

			// Disable the menu component
			if ( gameMenu )
				gameMenu.enabled = false;
			
			GetCooldowns();
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// If mouse movement is detected, then the mouse controls are activated
			if( Input.GetAxis("Mouse X") != 0 || Input.GetAxis("Mouse Y") != 0 )
				mouseControls = true;
			
			// If mouse movement is detected, then the mouse controls are activated
			if( Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0 )
				mouseControls = false;
			
			if ( mouseControls == true )
			{
				pointerPos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
				pointerPos.y = 5;

				pointer.position = pointerPos;
			}
			else if ( EventSystem.current.sendNavigationEvents == false )
			{
				// Move the pointer with the gamepad
				pointerPos.z += Input.GetAxis("Horizontal") * pointerSpeed * Time.deltaTime;
				pointerPos.x += Input.GetAxis("Vertical") * -pointerSpeed * Time.deltaTime;

				//Limit the position of the pointer to the move area
				if ( pointerPos.z < pointerMoveArea.x )    pointerPos.z = pointerMoveArea.x;
				if ( pointerPos.z > pointerMoveArea.width )    pointerPos.z = pointerMoveArea.width; 
				if ( pointerPos.x < pointerMoveArea.y )    pointerPos.x = pointerMoveArea.y;
				if ( pointerPos.x > pointerMoveArea.height )    pointerPos.x = pointerMoveArea.height; 

				pointer.position = pointerPos;
			}
			
			// Display the building cooldowns when using the new UI
			if ( useOldUI == false )
			{ 
				// Go through all the buildings in the build list
				for ( index = 0 ; index < buildListButtons.Length ; index++ )
				{
					if ( buildListButtons[index] && buildListButtons[index].GetComponent<Button>().interactable == true )
					{
						if ( buildList[index] )
						{
							if ( cooldown[index] > 0 )
							{
								// Only display the cooldown if it's more than 0
								if ( cooldownCount[index] < cooldown[index] )   
								{
									// Display the cooldown circle wipe based on the cooldown time left
									buildListButtons[index].Find("Cooldown").GetComponent<Image>().fillAmount = 1 - (cooldownCount[index]/cooldown[index]);
								}
								else if ( cooldownCount[index] != cooldown[index] )
								{
									cooldownCount[index] = cooldown[index];
									
									buildListButtons[index].Find("Cooldown").GetComponent<Image>().fillAmount = 0;
								}
							}
						}
					}
				}
				
				// Go through all the resource types the player has
				for ( int resourceIndex = 0 ; resourceIndex < moneyTypes.Length ; resourceIndex++ )
				{
					// Display how much money we have for this resource type
					if ( moneyTypes[resourceIndex].icon )
						moneyTypes[resourceIndex].icon.Find("Text").GetComponent<Text>().text = moneyTypes[resourceIndex].amount.ToString();
				}
			}
			
			// If we have the sell button active and we click the Right Mouse Button, cancel the sell action
			if ( Input.GetButtonDown("Fire2") && sell == true )
			{
				sell = false; // Clear the sell button

				//Start responding to navigation events ( for 4.6+ UI )
				if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
			}

			// If we have a building selected, allow the player to try to place it on a tile. If there are no placing errors put the building on the tile and activate it
			if (currentBuild)
			{
				// Try to place the current building on the tiles
				PlaceBuilding();
		
				// If we have a selected building and we click Right Mouse Button, remove it
				if (Input.GetButtonDown("Fire2") && currentBuild)
				{
					error = false; // There is no error
			
					//Start responding to navigation events ( for 4.6+ UI )
					if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;

					Destroy(currentBuild.gameObject);
				}
			}
	
			// Create a raycast from the camera to the mouse position and check collision with money objects
			//if (Physics.Raycast(Camera.main.ScreenPointToRay(Input.mousePosition), out hit, 100))
			if ( Physics.Raycast( pointer.position, -Vector3.up, out hit, 100) ) 
			{
				if (hit.collider.tag == "Money")
				{
					Money moneyComp = hit.collider.GetComponent<Money>();
					if ( moneyComp.resourceName != string.Empty && moneyTypes.Length > 0 )
					{
						CheckResourceList(moneyComp.resourceName, -moneyComp.money, true);
					}
					else
					{
						money += moneyComp.money;
					}
					
					if ( hit.collider.GetComponent<Money>().soundPickup )
						this.GetComponent<AudioSource>().PlayOneShot(hit.collider.GetComponent<Money>().soundPickup);
					
					hit.collider.GetComponent<Money>().pickedUp = true;
				}
	    
				if (sell)
				{
					Building building = hit.collider.GetComponent<Building>();

					if (building)
					{
						if (Input.GetButtonDown("Fire1"))
						{
							if (soundSell)
							this.GetComponent<AudioSource>().PlayOneShot(soundSell);

							if ( building.moneyCosts.Length > 0 && moneyTypes.Length > 0 )
							{
								foreach ( Cost resourceCost in building.moneyCosts )
								{
									Money moneyComp = resourceCost.moneyObject.GetComponent<Money>();

									CheckResourceList(moneyComp.resourceName, moneyComp.money * (int)-sellValue, true);
								}
							}
							else
							{
								//Add to the player's money based on the sell value of the building
								money += building.price * (int)sellValue;
							}
							// Destroy the sold building
							Destroy(hit.collider.gameObject);
	   	           
							//sell = false;
						}
					}
				}
			}
	
			// Go through all the buildings in the build list
			for (index = 0; index < buildList.Length; index++)
			{
				// Count only for available buildings
				if (buildList [index])
				{
					// Count up the cooldown timer for each building
					if (cooldownCount [index] < cooldown [index])
					{
						// Counting up
						cooldownCount [index] += Time.deltaTime;
					}
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
			GUI.skin = guiSkin;
			
			if ( useOldUI == true )
			{
				if ( moneyTypes.Length > 0 )
				{
					// Go through all the resource types the player has
					for ( int resourceIndex = 0 ; resourceIndex < moneyTypes.Length ; resourceIndex++ )
					{
						// Set the background of the money gui style
						GUI.skin.GetStyle("Money").normal.background = moneyTypes[resourceIndex].moneyObject.GetComponent<Money>().iconBig;
						
						// Display how much money we have
						GUI.Label( new Rect( resourceIndex * moneyIconSize.x, Screen.height - moneyIconSize.y, moneyIconSize.x, moneyIconSize.y), moneyTypes[resourceIndex].amount.ToString(), "Money");
					}
				}
				else
				{
					// Set the background of the money gui style
					GUI.skin.GetStyle("Money").normal.background = moneyIcon;
					
					// Display how much money we have
					GUI.Label( new Rect( 0, Screen.height - 64, 120, 64), money.ToString(), "Money");
				}
				
				// Display the buildings in a horizontal menu
				for ( index = 0 ;  index < buildList.Length ; index++ )
				{
					// Display buttons for each building with its icon, and check if we have money to build it
					if ( buildList[index] )
					{
						Building building = buildList[index].GetComponent<Building>();

						if ( GUI.Button(new Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), building.icon) )
						{
							PickBuilding(index);
						}
						
						if ( building.moneyCosts.Length > 0 && moneyTypes.Length > 0 )
						{
							// Display all the resource cost of a building
							for ( int resourceCostIndex = 0 ; resourceCostIndex < building.moneyCosts.Length ; resourceCostIndex++ )
							{
								//GUI.Label( Rect( index * buttonSize.x + 2, buttonSize.y - 30 + 30 * resourceCostIndex, buttonSize.x, 30), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
								//GUI.Box( Rect( index * buttonSize.x + 2, buttonSize.y + 25 * resourceCostIndex, buttonSize.x, 25), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
								//GUI.Box( Rect( index * buttonSize.x + resourceCostIndex * buttonSize.x * 0.5, buttonSize.y, buttonSize.x * 0.5, 25), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
								// Set the background of the money gui style
								Money money = building.moneyCosts[resourceCostIndex].moneyObject.GetComponent<Money>();

								GUI.skin.GetStyle("Resource").normal.background = money.iconSmall;
								
								GUI.skin.GetStyle("Resource").normal.textColor = money.textColor;
								
								GUI.Box( new Rect( index * buttonSize.x, resourceCostIndex * 20, 32, 32), building.moneyCosts[resourceCostIndex].cost.ToString(), "Resource");
								
								//print(buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].moneyObject.GetComponent(Money).resourceName.ToString());
								
								// Display how much money we have
								//GUI.Label( Rect( resourceIndex * moneyIconSize.x, Screen.height - moneyIconSize.y, moneyIconSize.x, moneyIconSize.y), moneyTypes[resourceIndex].amount.ToString(), "Money");
							}
						}
						else
						{
							// Display the price of a building
							GUI.Label(new Rect( index * buttonSize.x + 2, buttonSize.y - 30, buttonSize.x, 30), buildList[index].GetComponent<Building>().price.ToString());
						}
						
						// Display the cooldown for each building
						if ( cooldownCount[index] < cooldown[index] )   
						{
							// Display the cooldown bar based on the timer
							GUI.Box(new Rect(index * buttonSize.x,0,buttonSize.x,buttonSize.y - buttonSize.y * (cooldownCount[index]/cooldown[index])), string.Empty);
						}
					}
					else
					{
						GUI.Box(new Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), string.Empty);
					}
				}
			}
			
			// If we have a selected building display its icon
			if ( currentBuild )
			{
				// If mouse controls are on, draw the icon at the mouse position
				if ( mouseControls == true )
				{
					GUI.Label(new Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), currentBuild.GetComponent<Building>().icon);
				}
				else // Otherwise draw the icon at the position of the keyboard pointer
				{
					GUI.Label( new Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), currentBuild.GetComponent<Building>().icon);
				}
			}

			// If we have an error ( trying to place a building on top of another ) display the error icon at the position of the mouse
			if ( error )
			{
				// If mouse controls are on, draw the icon at the mouse position
				if ( mouseControls == true )
				{
					GUI.Label( new Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), errorIcon);
				}
				else // Otherwise draw the icon at the position of the keyboard pointer
				{
					GUI.Label( new Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), errorIcon);
				}
				
				//GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), errorIcon);
			}
			
			if ( sellIcon )
			{
				if ( useOldUI == true )
				{
					if ( GUI.Button(new Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), sellIcon) )
					{
						StartSell();
					}
				}
				
				if ( sell )
				{
					// If mouse controls are on, draw the icon at the mouse position
					if ( mouseControls == true )
					{
						GUI.Label(new  Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), sellIcon);
					}
					else // Otherwise draw the icon at the position of the keyboard pointer
					{
						GUI.Label(new Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), sellIcon);
					}
					
					//GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), sellIcon);
				}
			}
		}
		
		/// <summary>
		/// Picks a building from the build list, after checking if the cooldown is 0, and we have enough resources to build it
		/// </summary>
		/// <param name="buildingIndex">Building index</param>
		public void PickBuilding( int buildingIndex )
		{
			// If we have enough money, and the cooldown timer for the building is done, allow this building to be selected
			if ( cooldownCount[buildingIndex] >= cooldown[buildingIndex] )
			{
				if ( buildList[buildingIndex].GetComponent<Building>().moneyCosts.Length > 0 && moneyTypes.Length > 0 )
				{
					// A value to check if we meet all the resource costs
					int moneyCostsCheck = 0;
					Cost[] buildingCosts = buildList[buildingIndex].GetComponent<Building>().moneyCosts;

					foreach ( Cost resourceCost in buildingCosts )
					{
						if ( CheckResourceList(resourceCost.moneyObject.GetComponent<Money>().resourceName, resourceCost.cost, false) )
						{
							moneyCostsCheck++;
						}
					}
					
					if ( moneyCostsCheck == buildingCosts.Length )
					{
						// If we already have a selected building, remove it
						if ( currentBuild )
							Destroy(currentBuild.gameObject);
						
						// Set the new building as the selected one, and put it offscreen
						currentBuild = (Transform)Instantiate( buildList[buildingIndex], new Vector3(100,100,100), Quaternion.identity);

						MoneyMaker moneyMaker = currentBuild.GetComponent<MoneyMaker>();

						// Deactivate the main components of the building
						if ( moneyMaker )
							moneyMaker.enabled = false;

						Weapon weapon = currentBuild.GetComponent<Weapon>();

						if ( weapon )
							weapon.enabled = false;

						if ( currentBuild.GetComponent<Collider>())
							currentBuild.GetComponent<Collider>().enabled = false;
						
						// Set the current building index
						currentIndex = buildingIndex;
						
						// If the building has a collider, remove it so we don't collide with objects in the game ( An enemy, or another object )
                        if (currentBuild.GetComponent<Collider>())
                            currentBuild.GetComponent<Collider>().enabled = false;
						
						sell = false;
						
						if (this.GetComponent<AudioSource>() )
                            this.GetComponent<AudioSource>().Play();
					}
				}
				else if ( money - buildList[buildingIndex].GetComponent<Building>().price >= 0 )
				{
					// If we already have a selected building, remove it
					if ( currentBuild )
						Destroy(currentBuild.gameObject);
					
					// Set the new building as the selected one, and put it offscreen
					currentBuild = (Transform)Instantiate( buildList[buildingIndex], new Vector3(100,100,100), Quaternion.identity);
					
					// Deactivate the main components of the building
					MoneyMaker moneyMaker = currentBuild.GetComponent<MoneyMaker>();

					if ( moneyMaker )
						moneyMaker.enabled = false;

					Weapon weapon = currentBuild.GetComponent<Weapon>();

					if ( weapon )
						weapon.enabled = false;

					if ( currentBuild.GetComponent<Collider>() )
                        currentBuild.GetComponent<Collider>().enabled = false;
					
					// Set the current building index
					currentIndex = buildingIndex;
					
					// If the building has a collider, remove it so we don't collide with objects in the game ( An enemy, or another object )
                    if (currentBuild.GetComponent<Collider>())
                        currentBuild.GetComponent<Collider>().enabled = false;
					
					sell = false;
					
					if ( this.GetComponent<AudioSource>() )
                        this.GetComponent<AudioSource>().Play();
				}
			}
		}

		/// <summary>
		/// Try to place a building on the tiles. Some buildings require more than one tile, so you can't place them unless all the tiles they sit on are free
		/// </summary>
		public void PlaceBuilding()
		{
			//Stop responding to navigation events ( for 4.6+ UI )
			if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = false;

			Building currentBuilding = currentBuild.GetComponent<Building>();

			Transform[] freeTiles = new Transform[(int) currentBuilding.buildingSize.x * (int) currentBuilding.buildingSize.y];
			
			int tileCounter = 0;
			
			//Go through all the tiles that this building should sit on, and make sure they are all free
			for ( int tileIndexX = 0 ; tileIndexX < currentBuilding.buildingSize.x ; tileIndexX++ )
			{
				for ( int tileIndexY = 0 ; tileIndexY < currentBuilding.buildingSize.y ; tileIndexY++ )
				{
					// Create a raycast from the camera to the mouse position and check collision with a list of allowed tiles ( The raycast checks only the layers on the allowedTiles list )
					if ( Physics.Raycast( pointer.position + new Vector3(tileIndexY,0,tileIndexX), -Vector3.up,out  hit, 100, currentBuild.GetComponent<Building>().allowedTiles) ) 
					{
						Tile hitTile = hit.collider.GetComponent<Tile>();
						Building building = currentBuild.GetComponent<Building>();
						
						// Allow the building to be placed only if there is no building on the tile OR if this building is stackable and the tile has no stackable object on it
						if (hitTile.building == null || (hitTile.stackable == null && building.stackable == true))
						{
							freeTiles[tileCounter] = hit.collider.transform;
							
							tileCounter++;
						}
						else //We have an error because we tried to place the selected building on an occupied tile
						{
							error = true;
							
							currentBuild.gameObject.SetActive(false);
							
							return;
						}
					}
					else
					{
						return;
					}
				}
			}

			//If we passed this point, then all required tiles are free, and we can place the building

			error = false; // There is no error

			// Place the building on the correct tile
			currentBuild.position = freeTiles[0].position;
			currentBuild.gameObject.SetActive(true);

			// If we click the Left Mouse Button, place the building on the tile and reduce from the player's money, and activate the building
			if (Input.GetButtonDown("Fire1"))
			{
				//Start responding to navigation events ( for 4.6+ UI )
				if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;

				// Assign this building to the correct slot in the tile script wether it's a building or a stackable building
				for ( int tileCounterIndex = 0 ; tileCounterIndex < tileCounter ; tileCounterIndex++ )
				{
					if ( currentBuilding.stackable == true )
					{
						freeTiles[tileCounterIndex].GetComponent<Tile>().stackable = currentBuild;
					}
					else
					{
						freeTiles[tileCounterIndex].GetComponent<Tile>().building = currentBuild;
					}
				}

				if ( currentBuilding.moneyCosts.Length > 0 && moneyTypes.Length > 0)
				{
					foreach (var resourceCost in currentBuilding.moneyCosts)
					{
						CheckResourceList(resourceCost.moneyObject.GetComponent<Money>().resourceName, resourceCost.cost, true);
					}
				}
				else
				{
					// Reduce from the player's money
					money -= currentBuilding.price;
				}

				// Activate the main components of the building
				MoneyMaker moneyMaker = currentBuild.GetComponent<MoneyMaker>();
				
				if (moneyMaker)
					moneyMaker.enabled = true;
				
				Weapon weapon = currentBuild.GetComponent<Weapon>();
				
				if (weapon)
					weapon.enabled = true;
				
				if (currentBuild.GetComponent<Collider>())
                    currentBuild.GetComponent<Collider>().enabled = true;
				
				// Reset the cooldown counter to 0
				cooldownCount[currentIndex] = 0;
				
				// If the building has a build animation, play it
                if (currentBuild.GetComponent<Animation>())
                    currentBuild.GetComponent<Animation>().Play();
				
				// If the building has an audio, play it
                if (currentBuild.GetComponent<AudioSource>())
                    currentBuild.GetComponent<AudioSource>().Play();
				
				// Reset the building selection
				currentBuild = null;

				if (soundBuild)
                    GetComponent<AudioSource>().PlayOneShot(soundBuild);
                
			}
		}
		
		/// <summary>
		/// Goes through the build list, and deactivates all the build buttons in it
		/// </summary>
		public void ClearBuildList()
		{
			for ( index = 0 ; index < buildListButtons.Length ; index++ )
			{
				// Disable the icons of the building
				buildListButtons[index].Find("Icon").gameObject.SetActive(false);
				
				// Make the button of the building in the build list unclickable
				buildListButtons[index].GetComponent<Button>().interactable = false;
			}
		}
		
		/// <summary>
		/// Goes through the build list, and sets the icons for the building and money types for each
		/// </summary>
		public void SetBuildList()
		{
			int buildLimit = 0;
			
			// Limit the number of units that go into the final build list based on the lower number between buildListButtons.Length and buildList.Length 
			if ( buildListButtons.Length > buildList.Length )
				buildLimit = buildList.Length;
			else 
				buildLimit = buildListButtons.Length;
			
			for ( var index = 0 ; index < buildLimit ; index++ )
			{
				if ( buildList[index] != null )
				{
					Building building = buildList[index].GetComponent<Building>();
					if ( building )
					{
						// Make the button of the building in the build list unclickable
						buildListButtons[index].GetComponent<Button>().interactable = true;

						if ( buildListButtons[index].Find("Icon") )    
						{
							// Add the icon of the building
							buildListButtons[index].Find("Icon").GetComponent<Image>().sprite = Sprite.Create(building.icon , new Rect( 0, 0, building.icon.width, building.icon.height), new Vector2(0.5f, 0.5f));
							
							// Disable the icons of the building
							buildListButtons[index].Find("Icon").gameObject.SetActive(true);
						}
						
						// Go through all available money costs and set their icons
						for ( int moneyIndex = 0 ; moneyIndex < buildListButtons[index].Find("Icon").childCount ; moneyIndex++ )
						{
							if ( moneyIndex < buildList[index].GetComponent<Building>().moneyCosts.Length )
							{
								// Assign the icon of the money type
								buildListButtons[index].Find("Icon").GetChild(moneyIndex).GetComponent<Image>().sprite = Sprite.Create(building.moneyCosts[moneyIndex].moneyObject.GetComponent<Money>().iconSmall , new Rect( 0, 0, building.moneyCosts[moneyIndex].moneyObject.GetComponent<Money>().iconSmall.width, building.moneyCosts[moneyIndex].moneyObject.GetComponent<Money>().iconSmall.height), new Vector2(0.5f, 0.5f));
								
								// Assign the text of the cost of this money type
								buildListButtons[index].Find("Icon").GetChild(moneyIndex).Find("Text").GetComponent<Text>().text = buildList[index].GetComponent<Building>().moneyCosts[moneyIndex].cost.ToString();
							}
							else
							{
								buildListButtons[index].Find("Icon").GetChild(moneyIndex).gameObject.SetActive(false);
							}
						}
					}
				}
				else
				{
					// Disable the icons of the building
					buildListButtons[index].Find("Icon").gameObject.SetActive(false);
					
					// Make the button of the building in the build list unclickable
					buildListButtons[index].GetComponent<Button>().interactable = false;
					
				}
			}
		}
		
		/// <summary>
		/// Activates the sell ability. When clicking on a unit with this ability you can sell it.
		/// </summary>
		public void StartSell()
		{
			if ( sell == true )
			{
				sell = false;

				//Stop responding to navigation events ( for 4.6+ UI )
				if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
			}
			else
			{
				sell = true;

				//Stop responding to navigation events ( for 4.6+ UI )
				if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = false;
				
				// If we already have a selected building, remove it
				if ( currentBuild )
					Destroy(currentBuild.gameObject);
				
				// Reset the building selection
				currentBuild = null;
			}
		}

		/// <summary>
		/// Gets the cool downs for buildings.
		/// </summary>
		internal void GetCooldowns()
		{
			// Set the cooldown arrays to the same length as the build list array
			cooldown = new float[buildList.Length];
			cooldownCount = new float[buildList.Length];
	
			for (index = 0; index < cooldownCount.Length; index++)
			{
				// Set the cooldown for each building in the list
				if (buildList [index] && buildList [index].GetComponent<Building>())
					cooldown [index] = cooldownCount [index] = buildList [index].GetComponent<Building>().coolDown;
			}
		}

		/// <summary>
		/// Checks if we have enough of a resource, and returns true/false.
		/// </summary>
		/// <returns><c>true</c>, if resource list was checked, <c>false</c> otherwise.</returns>
		/// <param name="name">Name</param>
		/// <param name="amount">Amount</param>
		/// <param name="updateAmount">If set to <c>true</c> update amount.</param>
		internal bool CheckResourceList( string name, int amount, bool updateAmount )
		{
			// The value we will return, true or false
			bool checkResult = false;
			
			// Go through all the resource the player has
			foreach ( MoneyType resource in moneyTypes )
			{
				// First check is for the name of the resource
				if ( resource.moneyObject.GetComponent<Money>().resourceName == name )
				{
					// Second check is to see if we have enough of that resource
					if ( resource.amount - amount >= 0 )
					{
						checkResult = true;
						
						// If this is true, the value of the resource is updated, adding to it or substracting from it
						if ( updateAmount == true )
						{
							resource.amount -= amount;
						}
					}
				}
			}
			
			// Return the value
			return checkResult;
		}

		/// <summary>
		/// Draws the object spawn area in the editor
		/// </summary>
		public void OnDrawGizmosSelected()
		{
			Gizmos.color = Color.yellow;
			
			Gizmos.DrawLine(new Vector3(pointerMoveArea.y,0,pointerMoveArea.x), new Vector3(pointerMoveArea.y,0,pointerMoveArea.width));
			Gizmos.DrawLine(new Vector3(pointerMoveArea.y,0,pointerMoveArea.width), new Vector3(pointerMoveArea.height,0,pointerMoveArea.width));
			Gizmos.DrawLine(new Vector3(pointerMoveArea.height,0,pointerMoveArea.x), new Vector3(pointerMoveArea.height,0,pointerMoveArea.width));
			Gizmos.DrawLine(new Vector3(pointerMoveArea.height,0,pointerMoveArea.x), new Vector3(pointerMoveArea.y,0,pointerMoveArea.x));
		}
	}
}
