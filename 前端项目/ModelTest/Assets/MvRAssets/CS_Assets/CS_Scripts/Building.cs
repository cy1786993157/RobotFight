using UnityEngine;
using MvR.Types;

namespace MvR
{
	/// <summary>
	/// This script defines a building's attributes, name, icon, price, health, cooldown etc.
	/// It is mostly accessed by the GameController script to display stats in the build menu,
	/// and to check which tiles we can build on. A building may also have parts which are
	/// removed as it loses health.
	/// </summary>
	public class Building : MonoBehaviour
	{
		// Basic attributes of a building
		public string buildingName = "Building";
		public Vector2 buildingSize = new Vector2(1,1);
		public Texture2D icon;

		// The cost of a building; how much of each resource type it costs
		public Cost[] moneyCosts;

		public int price = 50;

		public float health = 100;
		private float healthMax;
		public float coolDown = 5;
		
		// Can this building be stacked on top of another?
		public bool stackable = false;
		
		// Which tiles we can place this building on
		public LayerMask allowedTiles;
		
		// Enemy parts that fall off as it loses health
		public Transform[] parts;
		private int partsHealth;
		private int partsLeft;
		
		// Effect created when a unit dies
		public Transform deathEffect;
		internal int listIndex;

		// List of animations for this building
		public AnimationClip idleAnimation;

		public GUISkin guiSkin;

		// The camera position
		private Vector3 cameraPosition;

		// The relative healthbar position
		public Rect healthBarPosition;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			healthMax = health;
	
			// Calculate the health for each part of the building
			partsHealth = (int)(health / (parts.Length + 1));
			partsLeft = parts.Length;
		}

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// If this object reaches 0 health, remove it from the game
			if( health <= 0 )
			{
				// Create a death effect if it's set
				if( deathEffect != null )
					Instantiate(deathEffect, transform.position, Quaternion.identity);

				Destroy(gameObject);
			}

			// If the building's health drops below the part health, remove that part
			if( partsLeft > 0 && health <= partsLeft * partsHealth )
			{
				partsLeft--;

				// Remove the correct part if it's available
				if( parts[partsLeft] )
				{
					// If the part has a Gib script, run it
					if( parts[partsLeft].GetComponent<Gib>() )
					{
						parts[partsLeft].GetComponent<Gib>().enabled = true;
						parts[partsLeft].GetComponent<Gib>().lane = transform;
					}
					else // Otherwise, destroy it
					{
						Destroy(parts[partsLeft].gameObject);
					}

					parts[partsLeft].transform.parent = null;
				}
			}

			// If there is no other animation playing on this object, play its idle animation
            //if ( animation )
            //{
            //    if ( !animation.isPlaying )
            //    {
            //        if ( idleAnimation )
            //        {
            //            if ( animation[idleAnimation.name] )
            //                animation.Play(idleAnimation.name);
            //        }
            //    }
            //}
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
	
			if( guiSkin != null )
			{
				if( Input.GetKey(KeyCode.H) )
				{
					// If health is larger than 0, display a health bar on the building
					if( health >= 0 )
					{
						cameraPosition = Camera.main.WorldToScreenPoint(transform.position);
						cameraPosition.y = Screen.height - (cameraPosition.y - 50);

						GUI.Box(new Rect(cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, healthBarPosition.width, healthBarPosition.height), health.ToString() + "/" + healthMax.ToString(), "Healthbar Red");
						GUI.Box(new Rect(cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, (health / healthMax) * healthBarPosition.width, healthBarPosition.height), "", "Healthbar Green");
					}
				}
			}
		}
	}
}