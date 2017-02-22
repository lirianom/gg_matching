$(document).ready(function() {
	var copy = document.querySelector('#copyId');
	copy.addEventListener('click', function(event) {
  	// Select the email link anchor text
  		var pid = document.querySelector('#pid');
  		var range = document.createRange();
  		range.selectNode(pid);
  		window.getSelection().addRange(range);

  		try {
    		// Now that we've selected the anchor text, execute the copy command
    		var successful = document.execCommand('copy');
    		var msg = successful ? 'successful' : 'unsuccessful';
    		console.log('Copy ID command was ' + msg);
  		} catch(err) {
	    	console.log('Oops, unable to copy');
	  	}

	  	// Remove the selections - NOTE: Should use
	  	// removeRange(range) when it is supported
  		window.getSelection().removeAllRanges();
	});
});
