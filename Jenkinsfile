pipeline {
    agent any

    environment {
        IMAGE = 'sapien99/release-alerter'
        TAG = 'latest'
    }

    stages {
        stage('Build') {
            agent any
            steps {
                checkout scm
                sh 'docker build -t $IMAGE:$TAG .'
            }
        }
        stage('Sign') {
            agent any
            steps {
                sh 'docker trust sign $IMAGE:$TAG'
            }
        }
        stage('Ansible') {
            agent any
            steps {
                dir("docker-build") {
                    sh 'ansible-playbook -i /etc/ansible/inventory.yaml deployment/playbook.yaml'
                }
            }
        }
    }
    post { 
        always { 
            cleanWs()
        }
    }
}
