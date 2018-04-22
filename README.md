# IS4302-Tut2Grp3-CbCR-via-Blockchain
POC to implement CbC report sharing using blockchain

# Setup
<b><p>1) MySQL server</p></b>
- Install the <b>MySQL Community Server 5.7.2x</b> from <a href="https://dev.mysql.com/downloads/mysql/5.7.html#downloads">MySQL</a>
- Run MySQL installer
- Select <b>Standalone MySQL Server</b> for Group Replication
- Select <b>Server Computer</b> as Config Type
- Select <b>admin</b> as MySQL root password
- Select "Configure MySQL Server as a Windows Service"
- Enter Windows Service Name as <b>"MySQL"</b>

<b><p>2) NodeJS</p></b>
- Install <a href="https://nodejs.org/en/download/">Node.js</a>

<b><p>3) Vagrant</p></b>
- Setup Vagrant according to this <a href="https://github.com/suenchunhui/fabric-tutorial-vagrant">link</a>
- Edit the <code>Vagrantfile</code> to open up ports used to expose composer REST server. Append the following near towards the end of the <code>Vagrantfile</code>
  <pre><code>config.vm.network :forwarded_port, guest: 3000, host: 3000  
  config.vm.network :forwarded_port, guest: 3001, host: 3001  
  config.vm.network :forwarded_port, guest: 3002, host: 3002  
  config.vm.network :forwarded_port, guest: 3003, host: 3003  
  </code></pre>
  
 <b><p>4) Hyperledger Fabric</p></b>
  - Download <code>Hyperledger-fabric</code> from this repo to your PC
  - Start <b>Vagrant</b>
  - Go to <b>Cloud 9</b> and issue the following commands:
    <pre><code><b>~/fabric-tutorial-vagrant/composer-playground$</b> docker pull hyperledger/fabric-couchdb:x86_64-1.0.4
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> docker tag hyperledger/fabric-couchdb:x86_64-1.0.4 hyperledger/fabric-couchdb:latest
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> git pull
    </code></pre>
  - Edit <code>docker-compose-couch.yaml</code> file, append the following to the ports subsection near the end of the file
    <pre><code>ports:
      - 8080:8080
      - 3000:3000
      - 3001:3001
      - 3002:3002
      - 3003:3003
    </code></pre>

<b><p>5) Deploy Network</p></b>
  - Start playground
    <pre><code><b>~/fabric-tutorial-vagrant/composer-playground$</b> ./playground.sh down
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> ./playground.sh -f docker-compose-couch.yaml up
    </code></pre>
  - Go to http://localhost:8080
  - <b>Import</b> the BNA file into composer playground
  - <b>Deploy</b> the BNA file with the following settings:
  ![Alt img](Hyperledger-fabric/setup-guide/network-deployment.jpeg?raw=true)
  - With the following credentials for network administrator:
    <pre><code>Enrollment ID: admin
    Enrollment secret: adminpw
    </code></pre>
  - Create <b>Participants</b>
    - In registry: <b>org.acme.cbcreporting.TaxAuthority</b>
      <pre><code>{
        "$class": "org.acme.cbcreporting.TaxAuthority",
        "taxAuthID": "IRAS",
        "taxAuthName": "IRAS",
        "countryCode": "SG",
        "partnerTaxAuth": ["AU","CA","ID","NZ","UK"]
      }

      {
        "$class": "org.acme.cbcreporting.TaxAuthority",
        "taxAuthID": "HMRC",
        "taxAuthName": "HMRC",
        "countryCode": "UK",
        "partnerTaxAuth": ["SG"]
      }
      </code></pre>
    - In registry: <b>org.acme.cbcreporting.SharedNode</b>
      <pre><code>{
        "$class": "org.acme.cbcreporting.SharedNode",
        "nodeID": "SG",
        "nodeName": "SG shared Node",
        "taxAuth": "resource:org.acme.cbcreporting.TaxAuthority#IRAS"
      }
      </code></pre>
  - Issue <b>New Identities</b>
    <table>
    <tr>
      <th>ID Name</th>
      <th>Participant</th>
    </tr>
    <tr>
      <td>SGSHAREDNODE</td>
      <td>org.acme.cbcreporting.SharedNode#SG</td>
    </tr>
    <tr>
      <td>IRAS</td>
      <td>org.acme.cbcreporting.TaxAuthority#IRAS</td>
    </tr>
    <tr>
      <td>HMRC</td>
      <td>org.acme.cbcreporting.TaxAuthority#HMRC</td>
    </tr>
    </table>

<b><p>6) Source Code</p></b>
- Download <code>MNE-portal-app</code> and <code>Tax-Authority-portal-app</code> from this repo to your PC
  - Open <b>cmd.exe</b>, navigate to the folder path and issue the following commands:
    <pre><code><b>\MNE-portal-app></b> npm install
    <b>\TaxAuthority-portal-app></b> npm install
    </code></pre>
    
# Preparing Test Data
<b><p>1) MySQL</p></b>
- Run <b>services.msc</b>
- Right click on MySQL and select Start
- Open <b>MySQL Command Line Client</b>
- Enter password as "admin" if being prompted
- Issue the following commands:
  <pre><code><b>mysql></b> CREATE DATABASE mne_portal;
  <b>mysql></b> USE mne_portal;
  <b>mysql></b> CREATE TABLE mne_info (mne_id VARCHAR(20) PRIMARY KEY, password CHAR(60));
  <b>mysql></b> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE1", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
  <b>mysql></b> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE2", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
  </code></pre>
- Two sets of credentials will be created (password is hashed):
  <table>
  <tr>
    <th>MNE ID</th>
    <th>Password</th>
  </tr>
  <tr>
    <td>SG-MNE1</td>
    <td>p@ssw0rd</td>
  </tr>
  <tr>
    <td>SG-MNE2</td>
    <td>p@ssw0rd</td>
  </tr>
  </table>

# Run
<b><p>1) Host REST Servers</p></b>
  - A total of 3 REST servers are hosted:
    <table>
    <tr>
      <th>Card Name</th>
      <th>IP Address:Port</th>
    </tr>
    <tr>
      <td>SGSHAREDNODE@cbcreporting</td>
      <td>localhost:3001</td>
    </tr>
    <tr>
      <td>IRAS@cbcreporting</td>
      <td>localhost:3002</td>
    </tr>
    <tr>
      <td>HMRC@cbcreporting</td>
      <td>localhost:3003</td>
    </tr>
    </table>
  - For each REST server, open a new terminal and issue this command to connect to the docker container:
    <pre><code><b>~/fabric-tutorial-vagrant/composer-playground$</b> docker exec -it cli bash
    </code></pre>
  - Once connected to the docker container, run this command inside the docker container:  <b>replace [port] and [card-name] according to the table above</b>
    <pre><code>composer-rest-server -p [port] -c [card-name]
    </code></pre>

<b><p>2) Start MySQL service</p></b>
  - Run <b>services.msc</b>
  - Right click on MySQL and select Start

<b><p>3) Start <code>MNE-portal-app</code> and <code>Tax-Authority-portal-app</code></p></b>
  - Open <b>cmd.exe</b> and navigate to the folder path
  - Issue the following commands:
    <pre><code><b>\MNE-portal-app></b> node app.js
    <b>\TaxAuthority-portal-app></b> node app.js
    </code></pre>
  - MNE portal can be accessed via http://localhost:4001
  - Tax Authority portal (IRAS) can be accessed via http://localhost:4002
  - Tax Authority portal (HMRC) can be accessed via http://localhost:4003

# Test Cases
<b><p>1) MNEs based in Singapore to submit and manage their CbC Reports through MNE Portal(SG)</p></b>
  <ol type="i">
  <li><b>Submit CbC Report</b>
    <ul>
      <li>Go to http://localhost:4001</li>
      <li>Login as <code>SG-MNE1</code> with password as <code>p@ssw0rd</code></li>
      <li>Navigate to <code>Submit CbCR</code></li>
      <li>Submit CbC Report with the following values:</li>
      <ul>
        <li><b>Financial Year:</b> 2016</li>
        <li><b>Subsidiary Countries:</b> SG, CA</li>
        <li><b>Report File:</b> SG-MNE1_FY2016.xlsx (stored in the subfolder named "reports")</li>
      </ul>
      <li>You will be able to see the uploaded CbC Report under "Manage CbCR" page</li>
    </ul>
  </li>
  <br/>
  <li><b>Download and Resubmit CbC Report</b>
    <ul>
      <li>Navigate to <code>Manage CbCR</code></li>
      <li>Click on the filename <code>SG-MNE1_FY2016.xlsx</code> to download the report</li>
      <li>Click on "Resubmit" button</li>
      <li>Select new <b>Subsidiary Countries:</b> SG, CA, UK</li>
      <li>Edit some of fields in the CbC report downloaded and reupload it</li>
      <li>The changes will be reflected accordingly under "Manage CbCR" page</li>
    </ul>
  </li>
  <br/>
  <li><b>Submit CbC Report as SG-MNE2</b>
    <ul>
      <li>Repeat part i as SG-MNE2 (password = p@ssw0rd)</li>
      <li>Submit CbC Report with the following values:</li>
      <ul>
        <li><b>Financial Year:</b> 2017</li>
        <li><b>Subsidiary Countries:</b> SG, ID, NZ</li>
        <li><b>Report File:</b> SG-MNE2_FY2017.xlsx (stored in the subfolder named "reports")</li>
      </ul>
    </ul>
  </li>
  </ol>
  
<b><p>2) IRAS to review and endorse CbC Reports</p></b>
  <ul>
    <li>Go to http://localhost:4002</li>
    <li>Navigate to <code>Endorse</code></li>
    <li>Filter the reports by different criterias, for example:</li>
    <ul>
      <li>SG-MNE1 + FY2016</li>
      <li>FY2018 (No results found)</li>
      <li>SG-MNE2</li>
    </ul>
    <li>Click on <code>SG-MNE1_FY2016.xlsx</code> to download the CbC Report</li>
    <li>Endorse both reports <code>SG-MNE1_FY2016.xlsx</code> and <code>SG-MNE2_FY2017.xlsx</code></li>
  </ul>
  
<b><p>3) HMRC to retrieve CbC Reports endorsed by IRAS</p></b>
  <ul>
    <li>Go to http://localhost:4003</li>
    <li>Navigate to <code>Retrieve</code></li>
    <li>Notice that HMRC is only able to view report submitted by SG-MNE1 but not SG-MNE2 (because SG-MNE2 has no subsidiaries in UK)</li>
    <li>Click on <code>SG-MNE1_FY2016.xlsx</code> to download the CbC Report</li>
  </ul>
  
<b><p>4) HMRC to manage its partner tax authorities</p></b>
  <ol type="i">
  <li><b>Add partner tax authority</b>
    <ul>
      <li>Navigate to <code>Partner Tax Authority</code></li>
      <li>Click on "Add New Partner" button</li>
      <li>Enter "NZ" as the country code to be added</li>
      <li>Click on "Submit" button and the new partner tax authority will be added</li>
    </ul>
  </li>
  <br>
  <li><b>Remove partner tax authority</b>
    <ul>
      <li>Navigate to <code>Partner Tax Authority</code></li>
      <li>Click on "Delete" button for partner named "ID"</li>
      <li>The partner tax authority will be deleted</li>
    </ul>
  </li>
  </ol>
