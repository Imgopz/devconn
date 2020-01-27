import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'


const DashboardActions = () => {
	return(
		<div className="dash-buttons">
        <Link to="edit-profile" className="btn btn-light">
			<i className="fa fa-user text-primary"></i> Edit Profile</Link>
        <Link to="add-experience" className="btn btn-light">
			<i className="fa fa-black-tie text-primary"></i> Add Experience</Link>
        <Link to="add-education" className="btn btn-light">
			<i className="fa fa-graduation-cap text-primary"></i> Add Education</Link>
      </div>
	)
}

DashboardActions.propTypes = {

}

export default DashboardActions;