/**
 * CBC Script File 
 */


//CreateCbcReport

/**
 * 
 * @param {org.acme.cbcreporting.CreateCbcReport} createCbcReport - the createCbcReport transaction
 * @transaction
 */
function createCbcReport(cbcreport) {
    return getAssetRegistry('org.acme.cbcreporting.CbcReport')
        .then(function (reportRegistry) {
            // Get the current participant.
            var currentParticipant = getCurrentParticipant();
            // Check to see if the current participant is a SharedNode.
            if (currentParticipant.getFullyQualifiedType() !== 'org.acme.cbcreporting.SharedNode') {
                // Throw an error as the current participant is not a SharedNode
                throw new Error('Current participant is not a SharedNode');
            }
            var currSharedNodeIdentifier = currentParticipant.getFullyQualifiedIdentifier();
            var factory = getFactory();
            var newcbcr = factory.newResource('org.acme.cbcreporting', 'CbcReport', cbcreport.reportID);
            var newRel = factory.newRelationship('org.acme.cbcreporting', 'SharedNode', currentParticipant.getIdentifier());
            newcbcr.reportName = cbcreport.reportName;
            newcbcr.mneID = cbcreport.mneID;
            newcbcr.dataFile = cbcreport.dataFile;
            newcbcr.financialYear = cbcreport.financialYear;
            newcbcr.subsidiaryCountryCode = cbcreport.subsidiaryCountryCode;
            newcbcr.sharedNode = newRel;
            newcbcr.isEndorsed = "false";
            newcbcr.sharedCountryList = [];
            newcbcr.createdDate = cbcreport.timestamp.toString();
            reportRegistry.add(newcbcr);
            var statusObj = { status: 'success' };
            var jsonStatus = JSON.stringify(statusObj);
            return jsonStatus;
        });
}

//UpdateCbcReport
/**
 * 
 * @param {org.acme.cbcreporting.UpdateCbcReport} updateCbcReport - the updateCbcReport transaction
 * @transaction
 */
function updateCbcReport(cbcreport) {
    //update cbcreport
    //when updating str8 input all data? 
    //Check if endorsed, else cant update. 
    //or form will request for reportID and mneID, via a transaction or javascript call and then submit update
    return getAssetRegistry('org.acme.cbcreporting.CbcReport')
        .then(function (reportRegistry) {
            //Get the specific report from the report asset registry
            return reportRegistry.get(cbcreport.reportID)
                .then(function (cbcrtoupdate) {
                    if (cbcrtoupdate.isEndorsed) {
                        throw new Error('Unable to update, report is already endorsed');
                    }
                    if (cbcrtoupdate.mneID != cbcreport.mneID) {
                        throw new Error('Incorrect mneID');
                    }
                    if (cbcrtoupdate.financialYear != cbcreport.financialYear) {
                        throw new Error('Incorrect Financial Year');
                    }

                    //Update the cbcreport
                    //Update report Name , datafile , subsidiary country code
                    cbcrtoupdate.reportName = cbcreport.reportName;
                    cbcrtoupdate.dataFile = cbcreport.dataFile;
                    cbcrtoupdate.subsidiaryCountryCode = cbcreport.subsidiaryCountryCode;
                    reportRegistry.update(cbcrtoupdate);
                    var statusObj = { status: 'success' };
                    var jsonStatus = JSON.stringify(statusObj);
                    return jsonStatus;
                })
        });
    //Function to update the cbcreport  
}

//Endorse CbC Report - For TaxAuthority to endorse a CbC report
/**
*
* @param {org.acme.cbcreporting.EndorseCbcReport} endorseCbcReport
* @transaction
*/
function endorseCbcReport(request) {
   //Inputs: String reportID
   //Conditions: CbcReport is not endorsed , CbcReport>SharedNode>TaxAuthority == CurrentParticipant
   //Get requestor aka TaxAuthority's partnerTaxAuth
   return getAssetRegistry('org.acme.cbcreporting.CbcReport')
   .then(function(cbcregistry){
       return cbcregistry.get(request.reportID)
  		.then(function(cbcreport){
       cbcreport.isEndorsed = "true";
       cbcreport.endorseDate = request.timestamp.toString();
       //Need to add in the shared country list
       var currentTaxAuthResource = getCurrentParticipant();
       cbcreport.sharedCountryList = currentTaxAuthResource.partnerTaxAuth;
       return cbcregistry.update(cbcreport);
       })
   })
}

//Add Partner Tax Authority - to add Tax Authority from PartnerTaxAuth
/**
*
* @param {org.acme.cbcreporting.AddPartnerTaxAuthority} addPartnerTaxAuthority
* @transaction
*/
function addPartnerTaxAuthority(request) {
    //Inputs: String taxAuthID, String countryCode
    //Conditions: Only for Regulator to Call
    return getParticipantRegistry('org.acme.cbcreporting.TaxAuthority')
        .then(function (taxAuthorityRegistry) {
            return taxAuthorityRegistry.get(request.taxAuthID)
            .then(function(taxAuthToUpdate){
                taxAuthToUpdate.partnerTaxAuth.push(request.countryCode);
                return taxAuthorityRegistry.update(taxAuthToUpdate);
            })
        })
}

//Delete Partner Tax Authority - to delete Tax Authority from PartnerTaxAuth
/**
 * 
 * @param {org.acme.cbcreporting.RemovePartnerTaxAuthority} removePartnerTaxAuthority
 * @transaction
 */
function removePartnerTaxAuthority(request) {
    //Inputs: String taxAuthID String countryCode
    //Conditions: Only for Regulator to Call
    //Get Tax Authority registry
    return getParticipantRegistry('org.acme.cbcreporting.TaxAuthority')
        .then(function (taxAuthorityRegistry) {
            return taxAuthorityRegistry.get(request.taxAuthID)
            .then(function(taxAuthToUpdate){
                taxAuthToUpdate.partnerTaxAuth = taxAuthToUpdate.partnerTaxAuth.filter(function(e){return e !== request.countryCode});
                return taxAuthorityRegistry.update(taxAuthToUpdate);
            })
        })
}







