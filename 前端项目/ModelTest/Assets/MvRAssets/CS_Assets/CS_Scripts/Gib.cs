using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script handles gibs, making them detach from a paretn object, and get thrown away, afterwhich they explode.
	/// </summary>
	public class Gib : MonoBehaviour
	{
		// Speed at which a gib is thrown
		public float verticalSpeed;
		public float horizontalSpeed;

		// How quickly it rotates
		public float spin = 10;

		// The gravity which pulls a gib down
		public float gravity = 10;

		// The lane in which the parent objet is
		public Transform lane;

		// How many seconds to wait before detroying the gib
		public float destroyAfter = 2;

		// The effect to be created when destroying this object
		public Transform destroyEffect;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Set the horizontal speed randomly within the limits
			horizontalSpeed = Random.Range(-horizontalSpeed, horizontalSpeed);
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// Change the gib's vertical speed
			verticalSpeed += gravity * Time.deltaTime;
    
			if( lane != null )
			{
				// Make the gib fall, but not further than the lane it's in
				if( transform.position.x < lane.position.x )
				{
					transform.Translate(Vector3.right * verticalSpeed * Time.deltaTime, Space.World);
					transform.Translate(Vector3.forward * horizontalSpeed * Time.deltaTime, Space.World);

					transform.Rotate(Vector3.up * spin * horizontalSpeed * Time.deltaTime, Space.World);
				}
				else if( transform.position.x != lane.position.x )
				{
					transform.position = new Vector3(lane.position.x, transform.position.y, transform.position.z);
				}
			}
			else // If the gib has no lane, allow it to fall all the way down
			{
				transform.Translate(Vector3.right * verticalSpeed * Time.deltaTime, Space.World);
				transform.Translate(Vector3.forward * horizontalSpeed * Time.deltaTime, Space.World);
			
				transform.Rotate(Vector3.up * spin * horizontalSpeed * Time.deltaTime, Space.World);
			}
    
			destroyAfter -= Time.deltaTime;
    
			if( destroyAfter <= 0 )
			{
				// Create an effect on destroy
				Instantiate(destroyEffect, transform.position, Quaternion.identity);
    	
				Destroy(transform.gameObject);
			}
		}
	}
}
