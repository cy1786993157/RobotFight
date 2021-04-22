using UnityEngine;

namespace MvR
{
	/// <summary>
	/// his script handles the money pick up. If the mouse moves over it, it's removed and added to the player's money.
	/// </summary>
	public class Money : MonoBehaviour
	{
		// The name of this resource type
		public string resourceName;

		// The money value of this pickup
		public int money = 50;

		// Did we pick up the money?
		internal bool pickedUp = false;

		// The dropoff point of the money
		public Transform dropoff;

		// How long to wait before removing the money
		public float removeAfter = 8;

		// The sound when picking up the money
		public AudioClip soundPickup;

		// Icons for this resource types
		public Texture2D iconSmall;
		public Texture2D iconBig;
		
		// The text color for this resource when displaying its name or value
		public Color textColor = Color.yellow;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled. 
		/// This allows you to delay any initialization code, until it is really needed. 
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Initialize the length at which this pickup exists before puffing out of existance!
			Destroy(transform.gameObject, removeAfter);
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			removeAfter -= Time.deltaTime;

			if( removeAfter <= 2 )
			{
				// If there are less than 2 seconds left for pickup, make the money object blink
				if( Mathf.Round(removeAfter * 20) % 2 == 1 )
				{
					foreach( Transform childTransform in transform )
					{
						childTransform.GetComponent<Renderer>().enabled = false;
					}
				}
				else
				{
					foreach( Transform childTransform in transform )
					{
                        childTransform.GetComponent<Renderer>().enabled = true;
					}
				}
			}
	
			// Picking up the money
			if( pickedUp == true )
			{
				// if( soundPickup ) audio.PlayOneShot(soundPickup);

				// Move the money towards the drop off point
				transform.position = Vector3.Slerp(transform.position, dropoff.position, Time.deltaTime * 10);
		
				// And then remove the money object
				if( Vector3.Distance(transform.position, dropoff.position) < 0.5f )
				{
					Destroy(transform.gameObject);
				}
			}
		}
	}
}
